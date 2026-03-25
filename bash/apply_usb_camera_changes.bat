@echo off
REM IoT-REAP USB/Camera improvements - Run this to apply changes
cd /d d:\projects\iot_reap

echo === Running migrations ===
php artisan migrate

echo.
echo === Clearing config cache ===
php artisan config:clear

echo.
echo === Verifying new routes ===
php artisan route:list --path=dedicate

echo.
echo === Testing camera service ===
php artisan tinker --execute="echo 'MqttService exists: ' . (class_exists(\App\Services\MqttService::class) ? 'YES' : 'NO');"

echo.
echo === Done! ===
pause
