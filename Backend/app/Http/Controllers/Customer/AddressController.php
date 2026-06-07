<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\UserAddress;
use App\Models\Village;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AddressController extends Controller
{
    // ========================================================
    // GET /api/customer/addresses
    // Semua alamat milik user yang sedang login
    // ========================================================
    public function index(Request $request)
    {
        $addresses = $request->user()
                             ->addresses()
                             ->orderByDesc('is_primary')
                             ->orderByDesc('created_at')
                             ->get();

        return response()->json($addresses);
    }

    // ========================================================
    // POST /api/customer/addresses
    // Tambah alamat baru
    // Body: { village_id, detail, is_primary? }
    // ========================================================
    public function store(Request $request)
    {
        $request->validate([
            'village_id' => 'required|exists:villages,id',
            'detail'     => 'required|string|max:500',
            'is_primary' => 'nullable|boolean',
        ]);

        // Ambil data wilayah untuk snapshot
        // Snapshot disimpan agar alamat tetap terbaca
        // meski admin edit/hapus wilayah di kemudian hari
        $village  = Village::with('district.city')->findOrFail($request->village_id);
        $district = $village->district;
        $city     = $district->city;

        $user = $request->user();

        DB::transaction(function () use ($request, $user, $village, $district, $city) {
            // Jika alamat baru ini dijadikan utama →
            // reset semua alamat lain milik user ini dulu
            if ($request->is_primary) {
                $user->addresses()->update(['is_primary' => false]);
            }

            // Jika ini alamat pertama user → otomatis jadi utama
            $isPrimary = $request->is_primary
                ?? ($user->addresses()->count() === 0);

            UserAddress::create([
                'user_id'       => $user->id,
                'village_id'    => $village->id,
                'city_name'     => $city->name,     // snapshot
                'district_name' => $district->name, // snapshot
                'village_name'  => $village->name,  // snapshot
                'detail'        => $request->detail,
                'is_primary'    => $isPrimary,
            ]);
        });

        return response()->json([
            'message'   => 'Alamat berhasil ditambahkan.',
            'addresses' => $user->addresses()
                                ->orderByDesc('is_primary')
                                ->get(),
        ], 201);
    }

    // ========================================================
    // PUT /api/customer/addresses/{address}
    // Edit alamat
    // Body: { village_id?, detail? }
    // ========================================================
    public function update(Request $request, UserAddress $address)
    {
        // Pastikan alamat ini milik user yang sedang login
        if ($address->user_id !== $request->user()->id) {
            abort(403);
        }

        $request->validate([
            'village_id' => 'sometimes|exists:villages,id',
            'detail'     => 'sometimes|string|max:500',
        ]);

        // Jika village_id berubah → update snapshot nama wilayah
        if ($request->has('village_id')) {
            $village  = Village::with('district.city')
                               ->findOrFail($request->village_id);
            $district = $village->district;
            $city     = $district->city;

            $address->village_id    = $village->id;
            $address->city_name     = $city->name;
            $address->district_name = $district->name;
            $address->village_name  = $village->name;
        }

        if ($request->has('detail')) {
            $address->detail = $request->detail;
        }

        $address->save();

        return response()->json([
            'message' => 'Alamat berhasil diperbarui.',
            'address' => $address,
        ]);
    }

    // ========================================================
    // DELETE /api/customer/addresses/{address}
    // Hapus alamat
    // Tidak boleh hapus alamat utama jika masih ada alamat lain
    // ========================================================
    public function destroy(Request $request, UserAddress $address)
    {
        if ($address->user_id !== $request->user()->id) {
            abort(403);
        }

        $user          = $request->user();
        $totalAddresses = $user->addresses()->count();

        // Jika alamat yang dihapus adalah utama
        // dan masih ada alamat lain → set alamat lain jadi utama
        if ($address->is_primary && $totalAddresses > 1) {
            $penggantiUtama = $user->addresses()
                                   ->where('id', '!=', $address->id)
                                   ->orderByDesc('created_at')
                                   ->first();

            $penggantiUtama->is_primary = true;
            $penggantiUtama->save();
        }

        $address->delete();

        return response()->json([
            'message' => 'Alamat berhasil dihapus.',
        ]);
    }

    // ========================================================
    // PUT /api/customer/addresses/{address}/primary
    // Set alamat sebagai alamat utama
    // ========================================================
    public function setPrimary(Request $request, UserAddress $address)
    {
        if ($address->user_id !== $request->user()->id) {
            abort(403);
        }

        DB::transaction(function () use ($request, $address) {
            // Reset semua alamat user ini dulu
            $request->user()->addresses()->update(['is_primary' => false]);

            // Set alamat ini jadi utama
            $address->is_primary = true;
            $address->save();
        });

        return response()->json([
            'message'   => 'Alamat utama berhasil diubah.',
            'addresses' => $request->user()
                                   ->addresses()
                                   ->orderByDesc('is_primary')
                                   ->get(),
        ]);
    }
}