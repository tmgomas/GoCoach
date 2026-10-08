<?php

require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$kernel->bootstrap();
$req = Illuminate\Http\Request::create('http://testclub.test/login');
$app->instance('request', $req);

$router = app('router');

// Find login route
$loginRoute = null;
$dashRoute = null;
foreach ($router->getRoutes() as $r) {
    if ($r->getName() === 'login' && in_array('GET', $r->methods())) {
        $loginRoute = $r;
    }
    if ($r->getName() === 'dashboard' && in_array('GET', $r->methods())) {
        $dashRoute = $r;
    }
}

echo "=== LOGIN ROUTE GATHERED MIDDLEWARE ===\n";
$mwsLogin = $router->gatherRouteMiddleware($loginRoute);
foreach ($mwsLogin as $i => $m) {
    echo "  $i: $m\n";
}

echo "\n=== DASHBOARD ROUTE GATHERED MIDDLEWARE ===\n";
$mwsDash = $router->gatherRouteMiddleware($dashRoute);
foreach ($mwsDash as $i => $m) {
    echo "  $i: $m\n";
}
