<?php

require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$kernel->bootstrap();
$app->instance('request', Illuminate\Http\Request::create('http://testclub.test'));

$db = app('db');
echo 'Initial default: '.$db->getDefaultConnection()."\n";
echo 'Initial connection name: '.$db->connection()->getName()."\n";

tenancy()->initialize('testclub');

echo "After tenancy initialize:\n";
echo 'Default connection config: '.config('database.default')."\n";
echo 'DB getDefaultConnection: '.$db->getDefaultConnection()."\n";
echo 'DB connection() name: '.$db->connection()->getName()."\n";
echo 'DB connection(null) name: '.$db->connection(null)->getName()."\n";
echo "DB connection('tenant') name: ".$db->connection('tenant')->getName()."\n";

$session = app('session')->driver();
$handler = $session->getHandler();
$ref = new ReflectionProperty($handler, 'connection');
$conn = $ref->getValue($handler);
echo 'Session handler connection name: '.$conn->getName()."\n";
echo 'Session handler database: '.$conn->getDatabaseName()."\n";
