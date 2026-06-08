<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\City;

class PublicController extends Controller
{
    // -------------------------------------------------------
    // GET /api/public/categories
    // Publik — tanpa token
    // Mengembalikan kategori aktif + service aktif di dalamnya
    // Termasuk harga per durasi untuk keperluan filter di frontend
    // -------------------------------------------------------
    public function categories()
    {
        $categories = Category::with(['services' => function ($query) {
                            // Hanya tampilkan service yang tidak di-soft-delete
                            $query->whereNull('deleted_at')
                                  ->select([
                                      'id',
                                      'category_id',
                                      'name',
                                      'price_1day', // null = tidak tersedia
                                      'price_2day',
                                      'price_3day',
                                  ]);
                        }])
                        ->whereNull('deleted_at') // hanya kategori aktif
                        ->get();

        return response()->json($categories);
    }

    // ========================================================
    // GET /api/customer/regions
    // Hierarki wilayah untuk dropdown alamat
    // Response: kota → kecamatan → kelurahan
    // Hanya tampilkan yang belum di-soft-delete
    // ========================================================
    public function regions()
    {
        $cities = City::whereNull('deleted_at')
                      ->with(['districts' => function ($query) {
                          $query->whereNull('deleted_at')
                                ->with(['villages' => function ($query) {
                                    $query->whereNull('deleted_at')
                                          ->select(['id', 'district_id', 'name'])
                                          ->orderBy('name');
                                }])
                                ->select(['id', 'city_id', 'name'])
                                ->orderBy('name');
                      }])
                      ->select(['id', 'name'])
                      ->orderBy('name')
                      ->get();

        return response()->json($cities);
    }
}