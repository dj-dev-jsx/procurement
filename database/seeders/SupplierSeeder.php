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
        // fetch category IDs by name
        $officeSuppliesId = DB::table('tbl_supplier_categories')->where('name', 'Office Supplies')->value('id');
        $itEquipmentId   = DB::table('tbl_supplier_categories')->where('name', 'IT Equipment')->value('id');
        $furnitureId     = DB::table('tbl_supplier_categories')->where('name', 'Furniture')->value('id');

        DB::table('tbl_suppliers')->insert([
            [
                'item' => 'Computer Parts',
                'category_id' => $itEquipmentId,
                'address' => '123 Tech Avenue, Quezon City',
                'tin_num' => '123-456-789',
                'company_name' => 'KD Computer Parts',
                'representative_name' => 'Juan Dela Cruz',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'item' => 'Office Papers',
                'category_id' => $officeSuppliesId,
                'address' => '456 Paper Lane, Manila',
                'tin_num' => '987-654-321',
                'company_name' => 'Maria Office Supplies',
                'representative_name' => 'Maria Clara',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'item' => 'Office Chairs',
                'category_id' => $furnitureId,
                'address' => '789 Furniture Blvd, Makati',
                'tin_num' => '111-222-333',
                'company_name' => 'KKK Furnitures',
                'representative_name' => 'Andres Bonifacio',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'item' => 'Laptops',
                'category_id' => $itEquipmentId,
                'address' => '88 Silicon Street, Pasig',
                'tin_num' => '222-333-444',
                'company_name' => 'TechWorld PH',
                'representative_name' => 'Jose Rizal',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'item' => 'Printers',
                'category_id' => $itEquipmentId,
                'address' => '99 Ink Road, Mandaluyong',
                'tin_num' => '333-444-555',
                'company_name' => 'InkTech Solutions',
                'representative_name' => 'Diego Silang',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'item' => 'Stationery',
                'category_id' => $officeSuppliesId,
                'address' => '21 Paper Ave, Caloocan',
                'tin_num' => '444-555-666',
                'company_name' => 'Stationery Hub',
                'representative_name' => 'Gabriela Silang',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'item' => 'Conference Tables',
                'category_id' => $furnitureId,
                'address' => '77 Office Park, Taguig',
                'tin_num' => '555-666-777',
                'company_name' => 'OfficeFit Furnitures',
                'representative_name' => 'Apolinario Mabini',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'item' => 'Desktops',
                'category_id' => $itEquipmentId,
                'address' => '321 Silicon Valley, QC',
                'tin_num' => '666-777-888',
                'company_name' => 'MegaTech Solutions',
                'representative_name' => 'Melchora Aquino',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'item' => 'Whiteboards',
                'category_id' => $officeSuppliesId,
                'address' => '654 Marker Street, Manila',
                'tin_num' => '777-888-999',
                'company_name' => 'EduSupply PH',
                'representative_name' => 'Emilio Aguinaldo',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'item' => 'Filing Cabinets',
                'category_id' => $furnitureId,
                'address' => '987 Steel Lane, Pasay',
                'tin_num' => '888-999-000',
                'company_name' => 'CabinetWorks',
                'representative_name' => 'Antonio Luna',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
