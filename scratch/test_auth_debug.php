<?php

require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

// 1. Send GET /login to get session cookie & token
$request = Illuminate\Http\Request::create('http://testclub.test/login', 'GET');
$response = $kernel->handle($request);
$kernel->terminate($request, $response);

$cookies = [];
foreach ($response->headers->getCookies() as $c) {
    $cookies[$c->getName()] = $c->getValue();
}
echo '1. GET /login status: '.$response->getStatusCode()."\n";
echo 'Cookies: '.implode(', ', array_keys($cookies))."\n";

// Get session from request
$sessionCookieName = config('session.cookie');
$sessionPayload = $cookies[$sessionCookieName] ?? null;
echo 'Session cookie present: '.($sessionPayload ? 'yes' : 'no')."\n";

// Decrypt XSRF-TOKEN cookie
$encrypter = $app->make('encrypter');
$xsrfToken = $encrypter->decrypt($cookies['XSRF-TOKEN'], false);
$token = explode('|', $xsrfToken)[1] ?? $xsrfToken;

// 2. Send POST /login
$postRequest = Illuminate\Http\Request::create('http://testclub.test/login', 'POST', [
    'email' => 'admin@testclub.test',
    'password' => 'password',
    '_token' => $token,
]);
$postRequest->cookies->add($cookies);
$postRequest->headers->set('X-XSRF-TOKEN', $token);
$postResponse = $kernel->handle($postRequest);
$kernel->terminate($postRequest, $postResponse);

echo '2. POST /login status: '.$postResponse->getStatusCode()."\n";
echo 'Location: '.$postResponse->headers->get('Location')."\n";

foreach ($postResponse->headers->getCookies() as $c) {
    $cookies[$c->getName()] = $c->getValue();
}

// 3. Send GET /dashboard with updated cookies
$dashRequest = Illuminate\Http\Request::create('http://testclub.test/dashboard', 'GET');
$dashRequest->cookies->add($cookies);
$dashResponse = $kernel->handle($dashRequest);
$kernel->terminate($dashRequest, $dashResponse);

echo '3. GET /dashboard status: '.$dashResponse->getStatusCode()."\n";
echo 'Location: '.$dashResponse->headers->get('Location')."\n";

foreach ($dashResponse->headers->getCookies() as $c) {
    $cookies[$c->getName()] = $c->getValue();
}

// 4. Send GET /admin/dashboard
$adminDashRequest = Illuminate\Http\Request::create('http://testclub.test/admin/dashboard', 'GET');
$adminDashRequest->cookies->add($cookies);
$adminDashResponse = $kernel->handle($adminDashRequest);
$kernel->terminate($adminDashRequest, $adminDashResponse);

echo '4. GET /admin/dashboard status: '.$adminDashResponse->getStatusCode()."\n";
echo 'Location: '.$adminDashResponse->headers->get('Location')."\n";
$html = $adminDashResponse->getContent();
preg_match_all('/<(link|script)[^>]+>/', $html, $m);
print_r($m[0]);
