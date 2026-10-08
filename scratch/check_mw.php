<?php

require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';

$app->make(Illuminate\Contracts\Http\Kernel::class);
$router = app('router');

$rl = $router->getRoutes()->match(Illuminate\Http\Request::create('http://testclub.test/login', 'GET'));
$rd = $router->getRoutes()->match(Illuminate\Http\Request::create('http://testclub.test/dashboard', 'GET'));

echo "=== LOGIN MIDDLEWARE ===\n";
print_r($router->gatherRouteMiddleware($rl));

echo "\n=== DASHBOARD MIDDLEWARE ===\n";
print_r($router->gatherRouteMiddleware($rd));
