<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create roles
        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        $requesterRole = Role::firstOrCreate(['name' => 'requester']);
        $bacApproverRole = Role::firstOrCreate(['name' => 'bac_approver']);
        $supplyOfficerRole = Role::firstOrCreate(['name' => 'supply_officer']);

        // Create admin user
        $admin = User::create([
            'firstname' => 'System',
            'lastname' => 'Administrator',
            'middlename' => '',
            'email' => 'admin@email.com',
            'email_verified_at' => now(),
            'password' => Hash::make('password123'),
        ]);
        $admin->assignRole($adminRole);

        // Create requester user
        $requester = User::create([
            'firstname' => 'Juan',
            'lastname' => 'Dela Cruz',
            'middlename' => 'M.',
            'email' => 'requester@email.com',
            'email_verified_at' => now(),
            'position' => 'Supply Officer',
            'division_id' => 1,
            'password' => Hash::make('password123'),
        ]);
        $requester->assignRole($requesterRole);

        // Create bac approver user
        $bacApprover = User::create([
            'firstname' => 'Maria',
            'lastname' => 'Santos',
            'middlename' => 'L.',
            'email' => 'bac@email.com',
            'email_verified_at' => now(),
            'password' => Hash::make('password123'),
        ]);
        $bacApprover->assignRole($bacApproverRole);

        // Create supply officer user
        $supplyOfficer = User::create([
            'firstname' => 'Pedro',
            'lastname' => 'Lopez',
            'middlename' => 'C.',
            'email' => 'supply@email.com',
            'email_verified_at' => now(),
            'password' => Hash::make('password123'),
        ]);
        $supplyOfficer->assignRole($supplyOfficerRole);
    }
}
