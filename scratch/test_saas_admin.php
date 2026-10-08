<?php

require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$kernel->bootstrap();

// Login as central super_admin
$user = App\Models\User::first();
echo "Central user: {$user->email}\n";

$req = Illuminate\Http\Request::create('http://nycsc.test/saas-admin/tenants', 'GET');
$req->setUserResolver(fn () => $user);
auth()->setUser($user);

$res = $kernel->handle($req);
echo "Status code: {$res->getStatusCode()}\n";

$tenants = App\Models\Tenant::with('domains')->get();
echo 'Found '.$tenants->count()." clubs.\n";
foreach ($tenants as $t) {
    echo "- ID: {$t->id}, Name: {$t->name}, Plan: {$t->plan?->value}, Hosting Renewal: ".($t->hosting_renewal_date?->toDateString() ?? 'none')."\n";
}
