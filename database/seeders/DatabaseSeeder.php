<?php

namespace Database\Seeders;

use App\Models\Division;
use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            BacCommitteeSeeder::class,
            RoleSeeder::class,
            UnitSeeder::class,
            CategorySeeder::class,
            ProductSeeder::class,
            DivisionSeeder::class,
            RequestingSeeder::class,
            SupplierSeeder::class,
            UserSeeder::class,
            InspectionCommitteeSeeder::class
        ]);
    }

}
