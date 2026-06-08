<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Service;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    public function index()
    {
        $services = Service::withTrashed()
                           ->with('category')
                           ->get();

        return response()->json($services);
    }

    public function store(Request $request)
    {
        $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name'        => 'required|string|max:255',
            'price_1day'  => 'nullable|numeric|min:0',
            'price_2day'  => 'nullable|numeric|min:0',
            'price_3day'  => 'nullable|numeric|min:0',
        ]);

        $service = Service::create([
            'category_id' => $request->category_id,
            'name'        => $request->name,
            'price_1day'  => $request->price_1day,
            'price_2day'  => $request->price_2day,
            'price_3day'  => $request->price_3day,
        ]);

        return response()->json([
            'message' => 'Service berhasil ditambahkan.',
            'service' => $service->load('category'),
        ], 201);
    }

    public function show(Service $service)
    {
        return response()->json($service->load('category'));
    }

    public function update(Request $request, Service $service)
    {
        $request->validate([
            'category_id' => 'sometimes|exists:categories,id',
            'name'        => 'sometimes|string|max:255',
            'price_1day'  => 'nullable|numeric|min:0',
            'price_2day'  => 'nullable|numeric|min:0',
            'price_3day'  => 'nullable|numeric|min:0',
        ]);

        $service->update($request->only([
            'category_id',
            'name',
            'price_1day',
            'price_2day',
            'price_3day',
        ]));

        return response()->json([
            'message' => 'Service berhasil diperbarui.',
            'service' => $service->load('category'),
        ]);
    }

    public function destroy(Service $service)
    {
        $service->delete();

        return response()->json([
            'message' => 'Service berhasil dinonaktifkan.',
        ]);
    }

    public function restore($id)
    {
        $service = Service::withTrashed()->findOrFail($id);
        $service->restore();

        return response()->json([
            'message' => 'Service berhasil dipulihkan.',
            'service' => $service->load('category'),
        ]);
    }
}