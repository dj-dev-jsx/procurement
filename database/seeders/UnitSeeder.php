<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UnitSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('tbl_units')->insert([
            [
                'id' => 1,
                'unit' => 'Ream',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 2,
                'unit' => 'Piece',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 3,
                'unit' => 'Set',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
