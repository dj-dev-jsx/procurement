<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Division;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class AdminController extends Controller
{
    public function view_users() {
        // Eager load division relation
        $users = User::with('division')->get();

        return Inertia::render('Admin/Users', [
            'users' => $users,
        ]);
    }
    public function dashboard() {
        return Inertia::render('Admin/Dashboard');
    }
    public function create_user_form() {
        $divisions = Division::all();
        $roles = Role::all(['id', 'name']);
        return Inertia::render('Admin/CreateUser', [
            'divisions' => $divisions,
            'roles' => $roles
        ]);
    }
}
