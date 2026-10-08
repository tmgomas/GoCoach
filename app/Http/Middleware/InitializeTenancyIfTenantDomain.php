<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Stancl\Tenancy\Resolvers\DomainTenantResolver;
use Stancl\Tenancy\Tenancy;

class InitializeTenancyIfTenantDomain
{
    public function __construct(
        protected Tenancy $tenancy,
        protected DomainTenantResolver $resolver
    ) {}

    public function handle(Request $request, Closure $next)
    {
        $hostname = $request->getHost();

        // If it's a central domain, keep default central connection
        if (in_array($hostname, config('tenancy.central_domains', []))) {
            return $next($request);
        }

        if (! $this->tenancy->initialized) {
            $tenant = $this->resolver->resolve($hostname);
            $this->tenancy->initialize($tenant);
        }

        return $next($request);
    }
}
