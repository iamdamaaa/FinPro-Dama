<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Service extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'category_id',
        'name',
        'price_1day',
        'price_2day',
        'price_3day',
    ];

    protected $casts = [
        'price_1day' => 'decimal:2',
        'price_2day' => 'decimal:2',
        'price_3day' => 'decimal:2',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}
