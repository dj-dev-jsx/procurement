<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('tbl_products')->insert([
            [
                'name' => 'Printer A',
                'specs' => 'Laser printer, 1200dpi, USB/Wi-Fi',
                'unit_id' => 2,
                'category_id' => 2, // Computer Peripherals
                'default_price' => 7500.00,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Monitor B',
                'specs' => '27" LED, 1920x1080, HDMI',
                'unit_id' => 2,
                'category_id' => 2,
                'default_price' => 4500.00,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Keyboard C',
                'specs' => 'Mechanical, RGB backlight, USB',
                'unit_id' => 3,
                'category_id' => 2,
                'default_price' => 1500.00,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Bond Paper A4',
                'specs' => '80gsm, White, 500 sheets per ream',
                'unit_id' => 1,
                'category_id' => 1, // Paper Products
                'default_price' => 250.00,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Bond Paper Legal',
                'specs' => '80gsm, White, 500 sheets per ream',
                'unit_id' => 1,
                'category_id' => 1,
                'default_price' => 280.00,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Colored Bond Paper',
                'specs' => '70gsm, Assorted colors, 100 sheets per pack',
                'unit_id' => 1,
                'category_id' => 1,
                'default_price' => 150.00,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
