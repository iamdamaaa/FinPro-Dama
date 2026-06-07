<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Service;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $category = Category::create(['name' => 'Boneka']);

        // Boneka Kecil — semua durasi tersedia
        Service::create([
            'category_id' => $category->id,
            'name'        => 'Boneka Kecil',
            'price_1day'  => 20000,
            'price_2day'  => 15000,
            'price_3day'  => 10000,
        ]);

        // Boneka Besar — 1 hari tidak tersedia (NULL)
        Service::create([
            'category_id' => $category->id,
            'name'        => 'Boneka Besar',
            'price_1day'  => null,
            'price_2day'  => 30000,
            'price_3day'  => 20000,
        ]);
    }
}