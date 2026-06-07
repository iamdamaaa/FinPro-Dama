<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\City;
use App\Models\District;
use App\Models\Village;
use Illuminate\Http\Request;

class RegionController extends Controller
{
    // ============================================================
    // CITIES
    // ============================================================

    // GET /api/admin/cities
    public function getCities()
    {
    $cities = City::withTrashed()
                  ->with(['districts' => function ($q) {
                        $q->withTrashed()
                          ->with(['villages' => function ($q) {
                              $q->withTrashed();
                          }]);
                  }])
                  ->get();
            return response()->json($cities);
        }

    // POST /api/admin/cities
    public function storeCity(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $city = City::create(['name' => $request->name]);

        return response()->json([
            'message' => 'Kota berhasil ditambahkan.',
            'city'    => $city,
        ], 201);
    }

    // PUT /api/admin/cities/{city}
    public function updateCity(Request $request, City $city)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $city->update(['name' => $request->name]);

        return response()->json([
            'message' => 'Kota berhasil diperbarui.',
            'city'    => $city,
        ]);
    }

    // DELETE /api/admin/cities/{city}
    public function destroyCity(City $city)
    {
        // Soft delete semua district dan village di bawahnya
        foreach ($city->districts as $district) {
            $district->villages()->update(['deleted_at' => now()]);
            $district->update(['deleted_at' => now()]);
        }

        $city->delete();

        return response()->json([
            'message' => 'Kota berhasil dihapus beserta kecamatan dan kelurahannya.',
        ]);
    }

    // ============================================================
    // DISTRICTS
    // ============================================================

    // POST /api/admin/districts
    public function storeDistrict(Request $request)
    {
        $request->validate([
            'city_id' => 'required|exists:cities,id',
            'name'    => 'required|string|max:255',
        ]);

        $district = District::create([
            'city_id' => $request->city_id,
            'name'    => $request->name,
        ]);

        return response()->json([
            'message'  => 'Kecamatan berhasil ditambahkan.',
            'district' => $district,
        ], 201);
    }

    // PUT /api/admin/districts/{district}
    public function updateDistrict(Request $request, District $district)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $district->update(['name' => $request->name]);

        return response()->json([
            'message'  => 'Kecamatan berhasil diperbarui.',
            'district' => $district,
        ]);
    }

    // DELETE /api/admin/districts/{district}
    public function destroyDistrict(District $district)
    {
        // Soft delete semua village di bawahnya
        $district->villages()->update(['deleted_at' => now()]);
        $district->delete();

        return response()->json([
            'message' => 'Kecamatan berhasil dihapus beserta kelurahannya.',
        ]);
    }

    // ============================================================
    // VILLAGES
    // ============================================================

    // POST /api/admin/villages
    public function storeVillage(Request $request)
    {
        $request->validate([
            'district_id' => 'required|exists:districts,id',
            'name'        => 'required|string|max:255',
        ]);

        $village = Village::create([
            'district_id' => $request->district_id,
            'name'        => $request->name,
        ]);

        return response()->json([
            'message' => 'Kelurahan berhasil ditambahkan.',
            'village' => $village,
        ], 201);
    }

    // PUT /api/admin/villages/{village}
    public function updateVillage(Request $request, Village $village)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $village->update(['name' => $request->name]);

        return response()->json([
            'message' => 'Kelurahan berhasil diperbarui.',
            'village' => $village,
        ]);
    }

    // DELETE /api/admin/villages/{village}
    public function destroyVillage(Village $village)
    {
        $village->delete();

        return response()->json([
            'message' => 'Kelurahan berhasil dihapus.',
        ]);
    }
}