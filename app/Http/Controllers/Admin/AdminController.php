<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Division;
use App\Models\RequestedBy;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class AdminController extends Controller
{
    public function view_users(Request $request) {
        $search = $request->input("search");
        $filters = $request->input("division");
        $perPage = $request->input("perPage", 10);
        // Eager load division relation
        $users = User::with('division', 'roles')
        ->when($search, function($query, $search){
            $query->where(function ($q) use ($search) {
                $q->where('firstname', 'like', "%{$search}%")
                ->orWhere("lastname", "like", "%{$search}%")
                ->orWhere("middlename", "like", "%{$search}%");
            });
        })
        ->when($filters, function ($query, $filters) {
            $query->where('division_id', $filters);
        })
        ->paginate(10)
        ->appends($request->all());
        $divisions = Division::select('id', 'division')->get();

        return Inertia::render('Admin/Users', [
            'users' => $users,
            'filters' => [
                'search' => $search,
                'division' => $filters,
                'divisions' => $divisions,
                'perPage' => $perPage,
            ]
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

    public function store_user(Request $request){
        $validated = $request->validate([
            'firstname' => 'required|string|max:255',
            'lastname' => 'required|string|max:255',
            'middlename' => 'nullable|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'division_id'   => 'required|exists:tbl_divisions,id',
            'password'      => 'required|string|min:8|confirmed',
            'position'      => 'required|string|max:255',
            'account_status'=> 'nullable|in:active,inactive',
            'role'           => 'required|exists:roles,name',
        ]);
        
        $validated['password'] = bcrypt($validated['password']);
        $validated['email_verified_at'] = now(); 
        $user = User::create($validated);
        $user->assignRole($request->role);
        return redirect()
        ->route('admin.view_users')
        ->with('success', 'User created successfully.');
    }

    public function requesting_officers(){
        $divisions = Division::with(['activeOfficer'])->get();
            return inertia('Admin/Requesting', [
            'divisions' => $divisions,
        ]);
    }
    public function edit_requesting(Division $division)
    {
        return inertia('Admin/EditRequesting', [
            'division' => $division,
            'activeOfficer' => $division->activeOfficer, // eager-loaded in model
        ]);
    }
    public function update_requesting(Request $request, Division $division)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        // Deactivate old officer if exists
        RequestedBy::where('division_id', $division->id)
            ->where('status', 'active')
            ->update(['status' => 'inactive']);

        // Add new officer
        RequestedBy::create([
            'division_id' => $division->id,
            'name' => $request->name,
            'status' => 'active',
        ]);

        return redirect()->route('admin.requesting')
            ->with('success', 'Requisitioning officer updated successfully.');
    }
}
