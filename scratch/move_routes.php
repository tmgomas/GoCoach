<?php

$webFile = __DIR__.'/../routes/web.php';
$tenantFile = __DIR__.'/../routes/tenant.php';

$webContent = file_get_contents($webFile);
$tenantContent = file_get_contents($tenantFile);

// Extract imports from web.php
preg_match_all('/use .*?;/', $webContent, $matches);
$imports = implode("\n", $matches[0]);

// Remove imports and <?php from webContent
$webContentWithoutImports = preg_replace('/<\?php\s*/', '', $webContent);
$webContentWithoutImports = preg_replace('/use .*?;\s*/', '', $webContentWithoutImports);

// Find the Route::middleware group in tenant.php
$pattern = '/Route::middleware\(\[\s*\'web\',\s*InitializeTenancyByDomain::class,\s*PreventAccessFromCentralDomains::class,\s*\]\)->group\(function \(\) \{\s*(.*?)\s*\}\);/s';

// Prepare the new tenant.php content
$newTenantContent = "<?php\n\ndeclare(strict_types=1);\n\n$imports\nuse Stancl\Tenancy\Middleware\InitializeTenancyByDomain;\nuse Stancl\Tenancy\Middleware\PreventAccessFromCentralDomains;\n\n/*\n|--------------------------------------------------------------------------\n| Tenant Routes\n|--------------------------------------------------------------------------\n*/\n\nRoute::middleware([\n    'web',\n    InitializeTenancyByDomain::class,\n    PreventAccessFromCentralDomains::class,\n])->group(function () {\n".$webContentWithoutImports."\n});\n";

file_put_contents($tenantFile, $newTenantContent);

$newWebContent = "<?php\n\nuse Illuminate\Support\Facades\Route;\n\nRoute::get('/', function () {\n    return 'Central SaaS Landing Page';\n});\n";

file_put_contents($webFile, $newWebContent);

echo "Routes moved successfully.\n";
