<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SupplierSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('tbl_suppliers')->insert([
            [
                'item' => 'Computer Parts',
                'category' => 'IT Equipment',
                'address' => '123 Tech Avenue, Quezon City',
                'tin_num' => '123-456-789',
                'company_name' => 'KD Computer Parts',
                'representative_name' => 'Juan Dela Cruz',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'item' => 'Office Supplies',
                'category' => 'Office Essentials',
                'address' => '456 Paper Lane, Manila',
                'tin_num' => '987-654-321',
                'company_name' => 'Maria Office Supplies',
                'representative_name' => 'Maria Clara',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'item' => 'Furnitures',
                'category' => 'IT Infrastructure',
                'address' => '789 Router Blvd, Makati',
                'tin_num' => '111-222-333',
                'company_name' => 'KKK Furnitures',
                'representative_name' => 'Andres Bonifacio',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);
    }
}
