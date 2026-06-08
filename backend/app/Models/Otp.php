<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Otp extends Model
{
    protected $fillable = [
        'phone',
        'name',
        'code',
        'resend_count',
        'expires_at',
        'window_start',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'window_start' => 'datetime',
    ];
}
