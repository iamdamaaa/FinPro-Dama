<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::create([
            'name'     => 'Admin Utama',
            'email'    => '14m.dama@gmail.com',
            'phone'    => '082313936353',
            'role'     => 'admin',
            'password' => '1',
        ]);
    }
}
