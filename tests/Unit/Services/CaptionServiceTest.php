<?php

namespace Tests\Unit\Services;

use App\Models\Caption;
use App\Models\Video;
use App\Repositories\CaptionRepository;
use App\Services\CaptionService;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class CaptionServiceTest extends TestCase
{
    use RefreshDatabase;

    private CaptionService $service;

    private $repository;

    private $video;

    protected function setUp(): void
    {
        parent::setUp();

        $this->repository = $this->createMock(CaptionRepository::class);
        $this->service = new CaptionService($this->repository);

        $this->video = $this->createMock(Video::class);
        $this->video->method('__get')->willReturnCallback(function ($property) {
            if ($property === 'id') {
                return 1;
            }
            if ($property === 'storage_disk') {
                return 'local';
            }

            return null;
        });
    }

    public function test_upload_delegates_to_upload_caption(): void
    {
        Storage::fake('local');

        $file = UploadedFile::fake()->create('test.vtt', 100, 'text/vtt');
        $language = 'en';
        $expectedCaption = $this->createMock(Caption::class);

        // Mock that no existing caption exists
        $this->repository
            ->expects($this->once())
            ->method('findByVideoAndLanguage')
            ->with($this->video->id, $language)
            ->willReturn(null);

        // Mock that it's the first caption (empty collection)
        $this->repository
            ->expects($this->once())
            ->method('getForVideo')
            ->with($this->video->id)
            ->willReturn(new Collection);

        $this->repository
            ->expects($this->once())
            ->method('create')
            ->with($this->callback(function ($data) use ($language) {
                return $data['video_id'] === $this->video->id &&
                       $data['language'] === $language &&
                       $data['label'] === 'English' &&
                       str_ends_with($data['file_path'], '/en.vtt') &&
                       $data['is_default'] === true;
            }))
            ->willReturn($expectedCaption);

        $result = $this->service->upload($this->video, $file, $language);

        $this->assertEquals($expectedCaption, $result);
        Storage::disk('local')->assertExists('videos/captions/1/en.vtt');
    }

    public function test_upload_caption_replaces_existing_caption(): void
    {
        Storage::fake('local');

        $file = UploadedFile::fake()->create('test.vtt', 100, 'text/vtt');
        $language = 'en';
        $oldFilePath = 'videos/captions/1/en_old.vtt';

        // Create old file
        Storage::disk('local')->put($oldFilePath, 'old content');

        $existingCaption = $this->createMock(Caption::class);
        $existingCaption->method('__get')->willReturnCallback(function ($property) use ($oldFilePath) {
            return match($property) {
                'file_path' => $oldFilePath,
                'id' => 1,
                'video_id' => 1,
                'language' => 'en',
                default => null,
            };
        });

        $updatedCaption = $this->createMock(Caption::class);

        $this->repository
            ->expects($this->once())
            ->method('findByVideoAndLanguage')
            ->with($this->video->id, $language)
            ->willReturn($existingCaption);

        $this->repository
            ->expects($this->once())
            ->method('update')
            ->with($existingCaption, $this->callback(function ($data) {
                return str_ends_with($data['file_path'], '/en.vtt') &&
                       $data['label'] === 'English';
            }))
            ->willReturn($updatedCaption);

        $result = $this->service->uploadCaption($this->video, $file, $language);

        $this->assertEquals($updatedCaption, $result);
        Storage::disk('local')->assertMissing($oldFilePath); // Old file deleted
        Storage::disk('local')->assertExists('videos/captions/1/en.vtt'); // New file created
    }

    public function test_upload_caption_converts_srt_to_vtt(): void
    {
        Storage::fake('local');

        $srtContent = "1\n00:00:01,000 --> 00:00:03,000\nHello world\n\n2\n00:00:04,000 --> 00:00:06,000\nGoodbye world";
        $file = UploadedFile::fake()->createWithContent('test.srt', $srtContent);
        $language = 'en';

        $expectedCaption = new Caption(['language' => $language]);

        $this->repository
            ->expects($this->once())
            ->method('findByVideoAndLanguage')
            ->willReturn(null);

        $this->repository
            ->expects($this->once())
            ->method('getForVideo')
            ->willReturn(new Collection);

        $this->repository
            ->expects($this->once())
            ->method('create')
            ->willReturn($expectedCaption);

        $this->service->uploadCaption($this->video, $file, $language);

        $storedContent = Storage::disk('local')->get('videos/captions/1/en.vtt');

        $this->assertStringStartsWith('WEBVTT', $storedContent);
        $this->assertStringContainsString('00:00:01.000 --> 00:00:03.000', $storedContent);
        $this->assertStringContainsString('Hello world', $storedContent);
        $this->assertStringNotContainsString('1\n', $storedContent); // Sequence numbers removed
    }

    public function test_get_captions_returns_mapped_caption_array(): void
    {
        $captions = new Collection([
            (object) [
                'id' => 1,
                'language' => 'en',
                'label' => 'English',
                'url' => '/captions/en.vtt',
                'is_default' => true,
            ],
            (object) [
                'id' => 2,
                'language' => 'ar',
                'label' => 'Arabic',
                'url' => '/captions/ar.vtt',
                'is_default' => false,
            ],
        ]);

        $expectedResult = [
            [
                'id' => 1,
                'language' => 'en',
                'label' => 'English',
                'url' => '/captions/en.vtt',
                'is_default' => true,
            ],
            [
                'id' => 2,
                'language' => 'ar',
                'label' => 'Arabic',
                'url' => '/captions/ar.vtt',
                'is_default' => false,
            ],
        ];

        $this->repository
            ->expects($this->once())
            ->method('getForVideo')
            ->with($this->video->id)
            ->willReturn($captions);

        $result = $this->service->getCaptions($this->video);

        $this->assertEquals($expectedResult, $result);
    }

    public function test_update_caption_validates_vtt_format_and_updates_content(): void
    {
        $validVttContent = "WEBVTT\n\n00:00:01.000 --> 00:00:03.000\nHello world";
        $caption = $this->createMock(Caption::class);
        $caption->id = 1;

        $caption->expects($this->once())
            ->method('updateContent')
            ->with($validVttContent);

        $result = $this->service->updateCaption($caption, $validVttContent);

        $this->assertEquals($caption, $result);
    }

    public function test_update_caption_throws_exception_for_invalid_vtt(): void
    {
        $invalidVttContent = 'This is not valid VTT content';
        $caption = $this->createMock(Caption::class);

        $this->expectException(\DomainException::class);
        $this->expectExceptionMessage('Invalid VTT format');

        $this->service->updateCaption($caption, $invalidVttContent);
    }

    public function test_delete_removes_file_and_sets_new_default_if_needed(): void
    {
        Storage::fake('local');

        $filePath = 'videos/captions/1/en.vtt';
        Storage::disk('local')->put($filePath, 'caption content');

        $caption = $this->createMock(Caption::class);
        $caption->method('__get')->willReturnCallback(function ($property) use ($filePath) {
            return match($property) {
                'file_path' => $filePath,
                'id' => 1,
                'is_default' => true,
                'video_id' => 1,
                'video' => $this->video,
                default => null,
            };
        });
        $caption->method('relationLoaded')->willReturn(false);
        $caption->method('load')->willReturn($caption);

        $otherCaption = $this->createMock(Caption::class);
        $otherCaption->id = 2;
        $otherCaption->expects($this->once())
            ->method('setAsDefault');

        $this->repository
            ->expects($this->once())
            ->method('getForVideo')
            ->with($this->video->id)
            ->willReturn(new Collection([$otherCaption, $caption]));

        $this->repository
            ->expects($this->once())
            ->method('delete')
            ->with($caption)
            ->willReturn(true);

        $result = $this->service->delete($caption);

        $this->assertTrue($result);
        Storage::disk('local')->assertMissing($filePath);
    }

    public function test_set_as_default_delegates_to_caption_model(): void
    {
        $caption = $this->createMock(Caption::class);
        $freshCaption = $this->createMock(Caption::class);

        $caption->expects($this->once())
            ->method('setAsDefault');
        $caption->expects($this->once())
            ->method('fresh')
            ->willReturn($freshCaption);

        $result = $this->service->setAsDefault($caption);

        $this->assertEquals($freshCaption, $result);
    }

    public function test_get_supported_languages_returns_language_array(): void
    {
        $result = $this->service->getSupportedLanguages();

        $this->assertIsArray($result);
        $this->assertArrayHasKey('en', $result);
        $this->assertEquals('English', $result['en']);
        $this->assertArrayHasKey('ar', $result);
        $this->assertEquals('Arabic', $result['ar']);
    }

    public function test_parse_vtt_extracts_cues_from_vtt_content(): void
    {
        $vttContent = "WEBVTT\n\n00:00:01.000 --> 00:00:03.000\nFirst subtitle\n\n00:00:04.000 --> 00:00:06.000\nSecond subtitle";

        $expectedCues = [
            [
                'start' => '00:00:01.000',
                'end' => '00:00:03.000',
                'text' => 'First subtitle',
            ],
            [
                'start' => '00:00:04.000',
                'end' => '00:00:06.000',
                'text' => 'Second subtitle',
            ],
        ];

        $result = $this->service->parseVtt($vttContent);

        $this->assertEquals($expectedCues, $result);
    }

    public function test_convert_srt_to_vtt_converts_format_correctly(): void
    {
        // Use reflection to test private method
        $reflection = new \ReflectionClass($this->service);
        $method = $reflection->getMethod('convertSrtToVtt');
        $method->setAccessible(true);

        $srtContent = "1\n00:00:01,500 --> 00:00:03,200\nHello world\n\n2\n00:00:05,000 --> 00:00:07,800\nGoodbye world";

        $result = $method->invoke($this->service, $srtContent);

        $this->assertStringStartsWith('WEBVTT', $result);
        $this->assertStringContainsString('00:00:01.500 --> 00:00:03.200', $result);
        $this->assertStringContainsString('00:00:05.000 --> 00:00:07.800', $result);
        $this->assertStringContainsString('Hello world', $result);
        $this->assertStringNotContainsString('1\n', $result); // Sequence numbers removed
    }

    public function test_is_valid_vtt_validates_vtt_format(): void
    {
        // Use reflection to test private method
        $reflection = new \ReflectionClass($this->service);
        $method = $reflection->getMethod('isValidVtt');
        $method->setAccessible(true);

        $validVtt = "WEBVTT\n\n00:00:01.000 --> 00:00:03.000\nHello world";
        $invalidVtt1 = "NOT WEBVTT\n\n00:00:01.000 --> 00:00:03.000\nHello world";
        $invalidVtt2 = "WEBVTT\n\nHello world without timestamps";

        $this->assertTrue($method->invoke($this->service, $validVtt));
        $this->assertFalse($method->invoke($this->service, $invalidVtt1));
        $this->assertFalse($method->invoke($this->service, $invalidVtt2));
    }
}
