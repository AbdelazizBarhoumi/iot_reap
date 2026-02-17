<?php

namespace Tests\Feature\Database;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class SchemaTest extends TestCase
{
    use RefreshDatabase;

    public function test_users_table_has_role_column(): void
    {
        $this->assertTrue(Schema::hasColumn('users', 'role'));
    }

    public function test_password_reset_tokens_table_exists_and_has_email_column(): void
    {
        $this->assertTrue(Schema::hasTable('password_reset_tokens'));
        $this->assertTrue(Schema::hasColumn('password_reset_tokens', 'email'));
    }
}
