<?php

require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$kernel->bootstrap();

tenancy()->initialize('testclub');
$u = App\Models\User::where('email', 'admin@testclub.test')->first();
echo 'User: '.$u->id.' / '.$u->email."\n";
echo 'Roles: '.implode(', ', $u->getRoleNames()->toArray())."\n";
