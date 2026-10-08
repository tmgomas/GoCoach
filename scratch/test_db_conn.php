<?php

require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$kernel->bootstrap();

$request = Illuminate\Http\Request::create('http://testclub.test/login', 'GET');

// Listen to DB queries
Illuminate\Support\Facades\DB::listen(function ($query) {
    echo 'QUERY on connection ['.$query->connectionName.']: '.$query->sql."\n";
    if (str_contains($query->sql, 'sessions')) {
        $trace = (new Exception)->getTrace();
        for ($i = 0; $i < 10; $i++) {
            if (isset($trace[$i])) {
                echo "  #$i ".($trace[$i]['file'] ?? '').'('.($trace[$i]['line'] ?? '').'): '.($trace[$i]['class'] ?? '').'->'.($trace[$i]['function'] ?? '')."\n";
            }
        }
    }
});

$app->afterResolving('session', function () {
    echo "=== 'session' RESOLVED! ===\n";
    $trace = (new Exception)->getTrace();
    for ($i = 20; $i < 35; $i++) {
        if (isset($trace[$i])) {
            echo "  #$i ".($trace[$i]['file'] ?? '').'('.($trace[$i]['line'] ?? '').'): '.($trace[$i]['class'] ?? '').'->'.($trace[$i]['function'] ?? '')."\n";
        }
    }
});

$app->afterResolving('session.store', function () {
    echo "=== 'session.store' RESOLVED! ===\n";
    $trace = (new Exception)->getTrace();
    for ($i = 0; $i < 6; $i++) {
        echo "  #$i ".($trace[$i]['file'] ?? '').'('.($trace[$i]['line'] ?? '').'): '.($trace[$i]['class'] ?? '').'->'.($trace[$i]['function'] ?? '')."\n";
    }
});

$response = $kernel->handle($request);
$kernel->terminate($request, $response);

echo 'STATUS: '.$response->getStatusCode()."\n";
echo 'Active DB: '.Illuminate\Support\Facades\DB::connection()->getDatabaseName()."\n";
echo 'Default connection config: '.config('database.default')."\n";
echo 'Session connection config: '.var_export(config('session.connection'), true)."\n";
