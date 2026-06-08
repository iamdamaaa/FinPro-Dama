<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserController extends Controller
{
    // GET /api/admin/users
    public function index()
    {
        $users = User::where('role', 'customer')
                     ->select('id', 'name', 'email', 'phone', 'created_at')
                     ->orderBy('created_at', 'desc')
                     ->get();

        return response()->json($users);
    }

    // POST /api/admin/admins
    // Admin baru login via OTP — tidak perlu password dari form
    // Password diisi random hash agar kolom NOT NULL terpenuhi
    public function storeAdmin(Request $request)
    {
        $request->validate([
            'name'  => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'phone' => 'required|string|unique:users,phone',
        ]);

        $admin = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'phone'    => $request->phone,
            'role'     => 'admin',
            'password' => Hash::make(Str::random(32)),
        ]);

        return response()->json([
            'message' => 'Admin baru berhasil ditambahkan.',
            'admin'   => $admin,
        ], 201);
    }
}