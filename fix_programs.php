<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

App\Models\Tenant::all()->each(function($tenant) {
    tenancy()->initialize($tenant);
    App\Models\Program::whereNull('short_code')->get()->each(function($p) use ($tenant) {
        $short = strtoupper(substr(preg_replace('/[^A-Za-z0-9]/', '', $p->name), 0, 2));
        $p->update(['short_code' => $short]);
        echo "Updated {$p->name} to {$short} in {$tenant->id}\n";
    });
    tenancy()->end();
});
echo "Done\n";
