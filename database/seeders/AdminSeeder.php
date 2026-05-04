<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function up(): void
    {
        // Admin Seeder uses run() not up()
    }

    public function run(): void
    {
        User::create([
            'name' => 'Admin',
            'email' => 'yusrilihzra@gmail.com',
            'password' => Hash::make('123'),
            'role' => 'admin',
        ]);
    }
}
