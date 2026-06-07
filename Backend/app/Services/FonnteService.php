<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FonnteService
{
    /**
     * Send WhatsApp Message via Fonnte
     */
    public static function sendMessage(string $target, string $message)
    {
$token = config('services.fonnte.token');
        if (!$token) {
            Log::warning('Fonnte API Token is not set.');
            return false;
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => $token,
            ])->post('https://api.fonnte.com/send', [
                'target' => $target,
                'message' => $message,
                'countryCode' => '62',
            ]);

            return $response->successful();
        } catch (\Exception $e) {
            Log::error('Fonnte Send Error: ' . $e->getMessage());
            return false;
        }
    }
}
