<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureProviderIsApproved
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || ! $user->hasRole('provider')) {
            return response()->json([
                'success' => false,
                'message' => 'Forbidden.',
                'data' => null,
            ], 403);
        }

        if ($user->status !== 'active' || $user->providerProfile?->verification_status !== 'verified') {
            return response()->json([
                'success' => false,
                'message' => 'Provider account is not approved yet.',
                'data' => null,
            ], 403);
        }

        return $next($request);
    }
}
