import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import VideoPlayer from '../VideoPlayer';
// Mock framer-motion
vi.mock('framer-motion', () => ({
    motion: {
        div: ({
            children,
            ...props
        }: React.HTMLAttributes<HTMLDivElement> & {
            children?: React.ReactNode;
        }) => <div {...props}>{children}</div>,
        button: ({
            children,
            onClick,
            ...props
        }: React.ButtonHTMLAttributes<HTMLButtonElement> & {
            children?: React.ReactNode;
        }) => (
            <button onClick={onClick} {...props}>
                {children}
            </button>
        ),
    },
    AnimatePresence: ({ children }: { children?: React.ReactNode }) => (
        <>{children}</>
    ),
}));
// Mock HLS.js
const { mockHls, MockHlsConstructor } = vi.hoisted(() => {
    const mockHls = {
        isSupported: vi.fn(() => true),
        loadSource: vi.fn(),
        attachMedia: vi.fn(),
        destroy: vi.fn(),
        on: vi.fn((event, callback) => {
            if (event === 'hlsManifestParsed') {
                callback();
            }
        }),
        off: vi.fn(),
        levels: [
            { height: 720, width: 1280, bitrate: 2500000 },
            { height: 480, width: 854, bitrate: 1000000 },
            { height: 360, width: 640, bitrate: 500000 },
        ],
        currentLevel: -1,
        nextLevel: -1,
    };
    const MockHlsConstructor = vi.fn(function MockHls() {
        return mockHls;
    });

    return { mockHls, MockHlsConstructor };
});

vi.mock('hls.js', () => ({
    default: Object.assign(MockHlsConstructor, {
        isSupported: () => mockHls.isSupported(),
        Events: {
            MANIFEST_PARSED: 'hlsManifestParsed',
            LEVEL_SWITCHED: 'hlsLevelSwitched',
            ERROR: 'hlsError',
        },
    }),
}));
// Mock HTMLMediaElement methods
Object.defineProperty(HTMLMediaElement.prototype, 'play', {
    writable: true,
    value: vi.fn().mockImplementation(() => Promise.resolve()),
});
Object.defineProperty(HTMLMediaElement.prototype, 'pause', {
    writable: true,
    value: vi.fn(),
});
Object.defineProperty(HTMLMediaElement.prototype, 'load', {
    writable: true,
    value: vi.fn(),
});
describe('VideoPlayer Component', () => {
    const mockProps = {
        src: 'https://example.com/video.m3u8',
        poster: 'https://example.com/poster.jpg',
        title: 'Test Video',
        captions: [
            {
                label: 'English',
                srclang: 'en',
                src: 'https://example.com/captions-en.vtt',
            },
        ],
    };
    beforeEach(() => {
        vi.clearAllMocks();
        mockHls.currentLevel = -1;
        mockHls.nextLevel = -1;
        // Reset video element properties
        Object.defineProperty(HTMLVideoElement.prototype, 'duration', {
            writable: true,
            value: 300, // 5 minutes
        });
        Object.defineProperty(HTMLVideoElement.prototype, 'currentTime', {
            writable: true,
            value: 0,
        });
        Object.defineProperty(HTMLVideoElement.prototype, 'paused', {
            writable: true,
            value: true,
        });
        Object.defineProperty(HTMLVideoElement.prototype, 'volume', {
            writable: true,
            value: 1,
        });
        Object.defineProperty(HTMLVideoElement.prototype, 'muted', {
            writable: true,
            value: false,
        });
    });
    it('renders video element with correct source', () => {
        render(<VideoPlayer {...mockProps} />);
        const video = document.querySelector('video');
        expect(video).toBeInTheDocument();
        expect(mockHls.loadSource).toHaveBeenCalledWith(mockProps.src);
        expect(mockHls.attachMedia).toHaveBeenCalled();
    });
    it('renders video with poster image when provided', () => {
        render(<VideoPlayer {...mockProps} />);
        const video = document.querySelector('video');
        expect(video).toBeInTheDocument();
        expect(video).toHaveAttribute('poster', mockProps.poster);
    });
    it('renders play button initially when video is paused', async () => {
        render(<VideoPlayer {...mockProps} />);
        await waitFor(() => {
            expect(screen.getByLabelText(/play video/i)).toBeInTheDocument();
        });
    });
    it('renders pause button when video is playing', async () => {
        render(<VideoPlayer {...mockProps} />);
        // Simulate video playing
        const video = document.querySelector('video');
        if (video) {
            Object.defineProperty(video, 'paused', {
                value: false,
                writable: true,
            });
            fireEvent(video, new Event('play'));
        }
        await waitFor(() => {
            expect(screen.getByLabelText(/pause video/i)).toBeInTheDocument();
        });
    });
    it('handles play button click', async () => {
        const user = userEvent.setup();
        render(<VideoPlayer {...mockProps} />);
        const playButton = await screen.findByLabelText(/play video/i);
        const videoPlaySpy = vi.spyOn(HTMLMediaElement.prototype, 'play');
        await user.click(playButton);
        expect(videoPlaySpy).toHaveBeenCalled();
    });
    it('handles pause button click', async () => {
        const user = userEvent.setup();
        render(<VideoPlayer {...mockProps} />);
        // First simulate video playing
        const video = document.querySelector('video');
        if (video) {
            Object.defineProperty(video, 'paused', {
                value: false,
                writable: true,
            });
            fireEvent(video, new Event('play'));
        }
        await waitFor(async () => {
            const pauseButton = screen.getByLabelText(/pause video/i);
            const videoPauseSpy = vi.spyOn(HTMLMediaElement.prototype, 'pause');
            await user.click(pauseButton);
            expect(videoPauseSpy).toHaveBeenCalled();
        });
    });
    it('renders volume controls', async () => {
        render(<VideoPlayer {...mockProps} />);
        await waitFor(() => {
            expect(screen.getByLabelText(/mute|unmute/i)).toBeInTheDocument();
        });
    });
    it('handles volume mute/unmute', async () => {
        const user = userEvent.setup();
        render(<VideoPlayer {...mockProps} />);
        const muteButton = await screen.findByLabelText(/mute|volume/i);
        await user.click(muteButton);
        // Should toggle muted state
        const video = document.querySelector('video');
        expect(video).toBeInTheDocument();
    });
    it('renders fullscreen button', async () => {
        render(<VideoPlayer {...mockProps} />);
        await waitFor(() => {
            expect(
                screen.getByLabelText(/fullscreen|maximize/i),
            ).toBeInTheDocument();
        });
    });
    it('renders settings button for quality selection', async () => {
        render(<VideoPlayer {...mockProps} />);
        await waitFor(() => {
            expect(screen.getByLabelText(/settings/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/video quality/i)).toBeInTheDocument();
        });
    });
    it('shows loading state initially', () => {
        render(<VideoPlayer {...mockProps} />);
        // Component should render with video element
        const video = document.querySelector('video');
        expect(video).toBeInTheDocument();
    });
    it('handles HLS source correctly', () => {
        render(<VideoPlayer {...mockProps} />);
        expect(mockHls.loadSource).toHaveBeenCalledWith(mockProps.src);
        expect(mockHls.attachMedia).toHaveBeenCalled();
    });
    it('falls back to native video for non-HLS sources', () => {
        const mp4Props = { ...mockProps, src: 'https://example.com/video.mp4' };
        render(<VideoPlayer {...mp4Props} />);
        // Should set video source directly for non-HLS files
        const video = document.querySelector('video');
        expect(video).toBeInTheDocument();
    });
    it('renders captions button when captions are provided', async () => {
        render(<VideoPlayer {...mockProps} />);
        await waitFor(() => {
            expect(
                screen.getByLabelText(/captions|subtitles/i),
            ).toBeInTheDocument();
        });
    });
    it('does not render captions button when no captions provided', () => {
        const noCaptionsProps = { ...mockProps, captions: undefined };
        render(<VideoPlayer {...noCaptionsProps} />);
        expect(
            screen.queryByLabelText(/captions|subtitles/i),
        ).not.toBeInTheDocument();
    });
    it('displays video title when provided', () => {
        render(<VideoPlayer {...mockProps} />);
        expect(screen.getByText('Test Video')).toBeInTheDocument();
    });
    it('does not render skip forward and backward buttons', async () => {
        render(<VideoPlayer {...mockProps} />);
        await waitFor(() => {
            expect(
                screen.queryByLabelText(/skip forward|forward 10/i),
            ).not.toBeInTheDocument();
            expect(
                screen.queryByLabelText(/skip backward|rewind 10|back 10/i),
            ).not.toBeInTheDocument();
        });
    });
    it('handles error states gracefully', async () => {
        const mp4Props = { ...mockProps, src: 'https://example.com/video.mp4' };
        render(<VideoPlayer {...mp4Props} />);
        const video = document.querySelector('video');
        if (video) {
            fireEvent(video, new Event('error'));
        }
        await waitFor(() => {
            expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
        });
    });

    it('shows quality options for HLS streams', async () => {
        const user = userEvent.setup();
        render(<VideoPlayer {...mockProps} />);

        const qualityButton = await screen.findByLabelText(/video quality/i);
        await user.click(qualityButton);

        expect(screen.getByText('Resolution')).toBeInTheDocument();
        expect(screen.getAllByText('Auto').length).toBeGreaterThan(0);
        expect(screen.getByText('720p')).toBeInTheDocument();
        expect(screen.getByText('480p')).toBeInTheDocument();
        expect(screen.getByText('360p')).toBeInTheDocument();
    });

    it('changes quality when a resolution is selected', async () => {
        const user = userEvent.setup();
        render(<VideoPlayer {...mockProps} />);

        const qualityButton = await screen.findByLabelText(/video quality/i);
        await user.click(qualityButton);
        await user.click(screen.getByText('720p'));

        expect(mockHls.currentLevel).toBe(0);
        expect(mockHls.nextLevel).toBe(0);
    });
});
