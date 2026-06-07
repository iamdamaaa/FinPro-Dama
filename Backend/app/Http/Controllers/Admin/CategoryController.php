<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    // -------------------------------------------------------
    // GET /api/admin/categories
    // Tampilkan semua kategori termasuk yang soft-deleted
    // Berguna untuk admin melihat semua data
    // -------------------------------------------------------
    public function index()
    {
        $categories = Category::withTrashed()
                               ->withCount('services')
                               ->get();

        return response()->json($categories);
    }

    // -------------------------------------------------------
    // POST /api/admin/categories
    // Tambah kategori baru
    // Body: { "name": "Sepatu" }
    // -------------------------------------------------------
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:categories,name',
        ]);

        $category = Category::create([
            'name' => $request->name,
        ]);

        return response()->json([
            'message'  => 'Kategori berhasil ditambahkan.',
            'category' => $category,
        ], 201);
    }

    // -------------------------------------------------------
    // GET /api/admin/categories/{id}
    // Detail satu kategori beserta service di dalamnya
    // -------------------------------------------------------
    public function show(Category $category)
    {
        $category->load('services');

        return response()->json($category);
    }

    // -------------------------------------------------------
    // PUT /api/admin/categories/{id}
    // Edit nama kategori
    // Body: { "name": "Sepatu & Sandal" }
    // -------------------------------------------------------
    public function update(Request $request, Category $category)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:categories,name,' . $category->id,
        ]);

        $category->update([
            'name' => $request->name,
        ]);

        return response()->json([
            'message'  => 'Kategori berhasil diperbarui.',
            'category' => $category,
        ]);
    }

    // -------------------------------------------------------
    // DELETE /api/admin/categories/{id}
    // Soft delete kategori
    // Service di bawahnya ikut di-soft-delete (sesuai MPV)
    // -------------------------------------------------------
    public function destroy(Category $category)
    {
        // Cek apakah kategori punya service aktif
        $activeServices = $category->services()->whereNull('deleted_at')->count();

        if ($activeServices > 0) {
            // Soft delete semua service di bawah kategori ini
            $category->services()->whereNull('deleted_at')->update([
                'deleted_at' => now(),
            ]);
        }

        // Soft delete kategorinya
        $category->delete();

        return response()->json([
            'message' => 'Kategori berhasil dihapus. ' . $activeServices . ' service ikut dinonaktifkan.',
        ]);
    }

    // -------------------------------------------------------
    // PUT /api/admin/categories/{id}/restore
    // Restore kategori yang sudah di-soft-delete
    // Opsional — berguna kalau admin tidak sengaja hapus
    // -------------------------------------------------------
    public function restore($id)
    {
        $category = Category::withTrashed()->findOrFail($id);
        $category->restore();

        return response()->json([
            'message'  => 'Kategori berhasil dipulihkan.',
            'category' => $category,
        ]);
    }
}