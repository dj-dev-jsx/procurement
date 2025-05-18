<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

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
}
