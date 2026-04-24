<?php
// Fix URI/Console environment issues
putenv('APP_URL=http://localhost');
$_SERVER['APP_URL'] = 'http://localhost';
$_SERVER['SERVER_NAME'] = 'localhost';
$_SERVER['REQUEST_METHOD'] = 'GET';

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';

$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;
use App\Models\UserVMConnectionDefaultProfile;
use App\Enums\UserRole;
use App\Repositories\UserVMConnectionDefaultProfileRepository;
use Illuminate\Support\Facades\DB;

function log_test($msg) { echo "[TEST] $msg\n"; }

DB::beginTransaction();

try {
    log_test("Initializing Admin...");
    $admin = User::where('role', UserRole::ADMIN)->first();
    if (!$admin) $admin = User::create(['name' => 'Admin', 'email' => 'a@a.com', 'password' => 'pass', 'role' => UserRole::ADMIN]);

    $repo = new UserVMConnectionDefaultProfileRepository();
    $vmId = 101;
    $protocol = 'rdp';
    $profileName = 'main';

    log_test("Step 1: Setting default for VM $vmId to '$profileName' via Repository...");
    $repo->setPerVMDefault($admin, $vmId, $protocol, $profileName);

    log_test("Step 2: Checking if repository returns the profile correctly...");
    $result = $repo->findPerVMDefault($admin, $vmId, $protocol);

    if ($result && $result->preferred_profile_name === $profileName) {
        log_test("SUCCESS: Profile saved and retrieved correctly.");
    } else {
        log_test("FAILURE: Profile not found or incorrect.");
        exit(1);
    }

    log_test("Step 3: Testing deletion (clearing default)...");
    $repo->deletePerVMDefault($admin, $vmId, $protocol);
    $checkDeleted = $repo->findPerVMDefault($admin, $vmId, $protocol);

    if (!$checkDeleted) {
        log_test("SUCCESS: Default profile cleared successfully.");
    } else {
        log_test("FAILURE: Default profile still exists.");
        exit(1);
    }

} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    exit(1);
} finally {
    DB::rollBack();
    log_test("Cleanup done.");
}
