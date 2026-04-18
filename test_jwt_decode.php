<?php
// Generate JWT same as test
$header = json_encode(['alg' => 'RS256', 'typ' => 'JWT']);
$headerEncoded = rtrim(strtr(base64_encode($header), '+/', '-_'), '=');

$claims = [
    'sub' => '123456789',
    'name' => 'John Doe',
    'email' => 'john@example.com',
    'picture' => 'https://example.com/avatar.jpg',
];

$payload = array_merge([
    'iss' => 'https://accounts.google.com',
    'azp' => 'test-client-id.apps.googleusercontent.com',
    'aud' => 'test-client-id.apps.googleusercontent.com',
    'iat' => time(),
    'exp' => time() + 3600,
    'email_verified' => true,
], $claims);

$payloadEncoded = rtrim(strtr(base64_encode(json_encode($payload)), '+/', '-_'), '=');
$signature = rtrim(strtr(base64_encode('fake_signature'), '+/', '-_'), '=');
$jwtToken = "{$headerEncoded}.{$payloadEncoded}.{$signature}";

echo "JWT Token: " . substr($jwtToken, 0, 50) . "...\n";

// Now decode it
$parts = explode('.', $jwtToken);
echo "Parts: " . count($parts) . "\n";

$payload_part = $parts[1];
$padding = 4 - (strlen($payload_part) % 4);
if ($padding < 4) {
    $payload_part .= str_repeat('=', $padding);
}

echo "Payload part length before: " . strlen($parts[1]) . "\n";
echo "Payload part length after padding: " . strlen($payload_part) . "\n";

$decoded = base64_decode(strtr($payload_part, '-_', '+/'), true);
echo "Decoded: " . ($decoded ? "success" : "failed") . "\n";

if ($decoded) {
    $payloadJson = json_decode($decoded, true);
    echo "JSON decode success: " . ($payloadJson ? "yes" : "no") . "\n";
    if ($payloadJson) {
        echo "Sub: " . ($payloadJson['sub'] ?? 'missing') . "\n";
        echo "Email: " . ($payloadJson['email'] ?? 'missing') . "\n";
    }
}
