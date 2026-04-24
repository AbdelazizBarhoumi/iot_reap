<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
	public function up(): void
	{
		Schema::table('reservations', function (Blueprint $table) {
			$table->string('vm_name')->nullable()->after('target_vm_id');

			$table->foreignId('training_path_id')
				->nullable()
				->after('target_user_id')
				->constrained('training_paths')
				->nullOnDelete();

			$table->boolean('is_backup_for_training_path')
				->default(false)
				->after('training_path_id');

			$table->index(['training_path_id', 'status'], 'idx_reservations_training_path_status');
		});
	}

	public function down(): void
	{
		Schema::table('reservations', function (Blueprint $table) {
			$table->dropIndex('idx_reservations_training_path_status');
			$table->dropConstrainedForeignId('training_path_id');
			$table->dropColumn('is_backup_for_training_path');
			$table->dropColumn('vm_name');
		});
	}
};

