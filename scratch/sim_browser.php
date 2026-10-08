<?php

$cookieFile = __DIR__.'/cookies.txt';
if (file_exists($cookieFile)) {
    unlink($cookieFile);
}

// 1. Initial GET
$ch = curl_init('http://nycsc.test/login');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_COOKIEJAR, $cookieFile);
curl_setopt($ch, CURLOPT_COOKIEFILE, $cookieFile);
curl_setopt($ch, CURLOPT_HEADER, true);
$response = curl_exec($ch);
if ($response === false) {
    echo 'Curl error: '.curl_error($ch)."\n";
} else {
    echo 'Initial GET succeeded, length: '.strlen($response)."\n";
}
curl_close($ch);

// Parse Set-Cookie headers
preg_match_all('/^Set-Cookie:\s*([^;]+)/mi', $response, $cookieMatches);
$cookies = [];
foreach ($cookieMatches[1] as $c) {
    [$name, $val] = explode('=', $c, 2);
    $cookies[trim($name)] = trim($val);
}
echo 'Parsed cookies: '.implode(', ', array_keys($cookies))."\n";

$xsrf = urldecode($cookies['XSRF-TOKEN'] ?? '');
echo 'Initial cookies obtained. XSRF: '.substr($xsrf, 0, 15)."...\n";

// 2. POST login
$ch = curl_init('http://nycsc.test/login');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$cookieHeader = [];
foreach ($cookies as $k => $v) {
    $cookieHeader[] = "$k=$v";
}
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Cookie: '.implode('; ', $cookieHeader),
    'X-XSRF-TOKEN: '.$xsrf,
    'Accept: text/html,application/xhtml+xml',
]);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
    'email' => 'superadmin@nysc.lk',
    'password' => 'password',
]));
curl_setopt($ch, CURLOPT_HEADER, true);
$res = curl_exec($ch);
$info = curl_getinfo($ch);
curl_close($ch);

// Update cookies from POST response
preg_match_all('/^Set-Cookie:\s*([^;]+)/mi', $res, $postCookieMatches);
foreach ($postCookieMatches[1] as $c) {
    [$name, $val] = explode('=', $c, 2);
    $cookies[trim($name)] = trim($val);
}

echo 'POST /login response code: '.$info['http_code']."\n";
echo 'Redirect to: '.($info['redirect_url'] ?: 'none')."\n";

$url = $info['redirect_url'];
$hop = 0;
while ($url && $hop < 15) {
    $hop++;
    echo "\n[Hop $hop] GET $url\n";
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $cookieHeader = [];
    foreach ($cookies as $k => $v) {
        $cookieHeader[] = "$k=$v";
    }
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Cookie: '.implode('; ', $cookieHeader),
        'Accept: text/html,application/xhtml+xml',
    ]);
    curl_setopt($ch, CURLOPT_HEADER, true);
    $res = curl_exec($ch);
    $info = curl_getinfo($ch);
    curl_close($ch);

    // Update cookies
    preg_match_all('/^Set-Cookie:\s*([^;]+)/mi', $res, $hopCookieMatches);
    foreach ($hopCookieMatches[1] as $c) {
        [$name, $val] = explode('=', $c, 2);
        $cookies[trim($name)] = trim($val);
    }

    echo 'Status: '.$info['http_code']."\n";
    echo 'Redirect: '.($info['redirect_url'] ?: 'none')."\n";
    $url = $info['redirect_url'];
}

echo "\n--- Testing GET /saas-admin/tenants/create ---\n";
$ch = curl_init('http://nycsc.test/saas-admin/tenants/create');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$cookieHeader = [];
foreach ($cookies as $k => $v) {
    $cookieHeader[] = "$k=$v";
}
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Cookie: '.implode('; ', $cookieHeader),
    'Accept: text/html,application/xhtml+xml',
]);
curl_setopt($ch, CURLOPT_HEADER, true);
$res = curl_exec($ch);
$info = curl_getinfo($ch);
curl_close($ch);
echo 'Create page HTTP Status: '.$info['http_code']."\n";

echo "\n--- Testing GET /saas-admin/tenants/testclub ---\n";
$ch = curl_init('http://nycsc.test/saas-admin/tenants/testclub');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Cookie: '.implode('; ', $cookieHeader),
    'Accept: text/html,application/xhtml+xml',
]);
curl_setopt($ch, CURLOPT_HEADER, true);
$res = curl_exec($ch);
$info = curl_getinfo($ch);
curl_close($ch);
echo 'Show page HTTP Status: '.$info['http_code']."\n";

echo "\n--- Testing GET /saas-admin/tenants/testclub/edit ---\n";
$ch = curl_init('http://nycsc.test/saas-admin/tenants/testclub/edit');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Cookie: '.implode('; ', $cookieHeader),
    'Accept: text/html,application/xhtml+xml',
]);
curl_setopt($ch, CURLOPT_HEADER, true);
$res = curl_exec($ch);
$info = curl_getinfo($ch);
curl_close($ch);
echo 'Edit page HTTP Status: '.$info['http_code']."\n";

echo "\nFlow simulation completed.\n";
