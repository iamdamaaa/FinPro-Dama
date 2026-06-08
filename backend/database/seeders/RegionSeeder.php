<?php

namespace Database\Seeders;

use App\Models\City;
use App\Models\District;
use App\Models\Village;
use Illuminate\Database\Seeder;

class RegionSeeder extends Seeder
{
    public function run(): void
    {
        $city = City::create(['name' => 'Semarang']);

        $district = District::create([
            'city_id' => $city->id,
            'name'    => 'Banyumanik',
        ]);

        Village::create([
            'district_id' => $district->id,
            'name'        => 'Sumurboto',
        ]);
    }
}