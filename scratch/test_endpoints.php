<?php

$cookieFile = __DIR__.'/cookies.txt';

$endpoints = [
    'GET /saas-admin/tenants' => 'http://nycsc.test/saas-admin/tenants',
    'GET /saas-admin/tenants/create' => 'http://nycsc.test/saas-admin/tenants/create',
];

foreach ($endpoints as $label => $url) {
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_COOKIEFILE, $cookieFile);
    $res = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    echo "$label -> HTTP $code\n";
    curl_close($ch);
}
