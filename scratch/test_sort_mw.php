<?php

require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

$router = app('router');
$priority = (new ReflectionProperty($router, 'middlewarePriority'))->getValue($router);

echo "PRIORITY LIST:\n";
foreach ($priority as $i => $mw) {
    echo "  $i: $mw\n";
}

$webMw = $router->getMiddlewareGroups()['web'];
echo "\nWEB GROUP:\n";
foreach ($webMw as $i => $mw) {
    echo "  $i: $mw\n";
}

// Now sort the web group:
$tenantMw = array_merge(
    $webMw,
    [
        Stancl\Tenancy\Middleware\InitializeTenancyByDomain::class,
        Stancl\Tenancy\Middleware\PreventAccessFromCentralDomains::class,
        'auth',
        'verified',
    ]
);

$sortedTenant = (new Illuminate\Routing\SortedMiddleware($priority, $tenantMw))->all();
echo "\nSORTED TENANT ROUTE MIDDLEWARE:\n";
foreach ($sortedTenant as $i => $mw) {
    echo "  $i: $mw\n";
}
