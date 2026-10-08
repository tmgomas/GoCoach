<?php

require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Http\Kernel::class)->bootstrap();
use Illuminate\Support\Facades\DB;

echo "=== RECENT CENTRAL SESSIONS ===\n";
$centralRows = DB::select('SELECT id, user_id, ip_address, FROM_UNIXTIME(last_activity) as dt FROM nysc.sessions ORDER BY last_activity DESC LIMIT 3');
print_r($centralRows);

echo "\n=== RECENT TENANT SESSIONS ===\n";
$tenantRows = DB::select('SELECT id, user_id, ip_address, FROM_UNIXTIME(last_activity) as dt FROM tenanttestclub.sessions ORDER BY last_activity DESC LIMIT 3');
print_r($tenantRows);
