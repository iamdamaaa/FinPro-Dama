<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Service;
use App\Models\UserAddress;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use App\Mail\OrderNotification;

class OrderController extends Controller
{
    // ========================================================
    // GET /api/customer/orders/active
    // Pesanan yang sedang aktif (bukan selesai/dibatalkan)
    // Ditampilkan di halaman tracking
    // ========================================================
    public function active(Request $request)
    {
        $orders = $request->user()
                          ->orders()
                          ->whereNotIn('status', ['delivered', 'cancelled'])
                          ->with(['items', 'address'])
                          ->orderBy('created_at', 'desc')
                          ->get();

        return response()->json($orders->map(fn($order) => $this->formatOrder($order)));
    }

    // ========================================================
    // GET /api/customer/orders/history
    // Pesanan selesai dan dibatalkan
    // Ditampilkan di halaman riwayat
    // ========================================================
    public function history(Request $request)
    {
        $orders = $request->user()
                          ->orders()
                          ->whereIn('status', ['delivered', 'cancelled'])
                          ->with(['items', 'address'])
                          ->orderBy('created_at', 'desc')
                          ->get();

        return response()->json($orders->map(fn($order) => $this->formatOrder($order)));
    }

    // ========================================================
    // GET /api/customer/orders/{order}
    // Detail satu pesanan — read only untuk customer
    // ========================================================
    public function show($code)
    {
        $order = Order::where('order_code', $code)
                    ->where('user_id', auth()->id())
                    ->with(['items', 'address'])
                    ->firstOrFail();

        return response()->json($order);
    }

    // ========================================================
    // POST /api/customer/orders
    // Buat pesanan baru
    // ========================================================
    public function store(Request $request)
    {
        $request->validate([
            'address_id'             => 'required|exists:user_addresses,id',
            'duration_days'          => 'required|in:1,2,3',
            'pickup_date'            => 'required|date|after_or_equal:today',
            'note'                   => 'nullable|string',
            'items'                  => 'required|array|min:1',
            'items.*.service_id'     => 'required|exists:services,id',
            'items.*.quantity'       => 'required|integer|min:1',
        ]);

        $user = $request->user();

        // Pastikan alamat memang milik user ini
        $address = UserAddress::where('id', $request->address_id)
                              ->where('user_id', $user->id)
                              ->firstOrFail();

        $pickupDate   = \Carbon\Carbon::parse($request->pickup_date);
        $deliveryDate = $pickupDate->copy()->addDays((int) $request->duration_days);

        try {
            $order = DB::transaction(function () use (
                $request, $user, $address, $pickupDate, $deliveryDate
            ) {
                $order = Order::create([
                    'user_id'       => $user->id,
                    'address_id'    => $address->id,
                    'customer_name' => $user->name,
                    'order_code'    => $this->generateOrderCode(),
                    'duration_days' => $request->duration_days,
                    'pickup_date'   => $pickupDate,
                    'delivery_date' => $deliveryDate,
                    'note'          => $request->note,
                    'total_price'   => 0,
                ]);

                $total        = 0;
                $priceColumn  = 'price_' . $request->duration_days . 'day';

                foreach ($request->items as $itemReq) {
                    $service = Service::findOrFail($itemReq['service_id']);
                    $price   = $service->{$priceColumn};

                    // Cek apakah service tersedia untuk durasi ini
                    if (is_null($price)) {
                        throw new \Exception(
                            'Service "' . $service->name . '" tidak tersedia untuk durasi ' .
                            $request->duration_days . ' hari.'
                        );
                    }

                    $subtotal = $price * $itemReq['quantity'];
                    $total   += $subtotal;

                    OrderItem::create([
                        'order_id'     => $order->id,
                        'service_id'   => $service->id,
                        'service_name' => $service->name,
                        'quantity'     => $itemReq['quantity'],
                        'price'        => $price,
                        'subtotal'     => $subtotal,
                    ]);
                }

                $order->total_price = $total;
                $order->save();

                return $order;
            });

            // Notifikasi email ke kantor — sesuai spesifikasi bab 13.2
            $kantorEmail = config('mail.kantor_address');
            if ($kantorEmail) {
                Mail::to($kantorEmail)->queue(
                    new OrderNotification($order, 'pending')
                );
            }

            // Notifikasi email ke user
            if ($user->email) {
                Mail::to($user->email)->queue(
                    new OrderNotification($order, 'pending')
                );
            }

            $order->load(['items', 'address']);

            return response()->json([
                'message' => 'Pesanan berhasil dibuat.',
                'order'   => $this->formatOrder($order),
            ], 201);

        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    // ========================================================
    // POST /api/customer/orders/{order}/cancel
    // Batalkan pesanan — hanya bisa saat status pending
    // ========================================================
    public function cancel(Request $request, $code)
    {
        $order = Order::where('order_code', $code)
                        ->where('user_id', $request->user()->id)
                        ->firstOrFail();

        if ($order->status !== 'pending') {
            return response()->json([
                'message' => 'Hanya pesanan yang belum diproses yang dapat dibatalkan.'
            ], 400);
        }

        $request->validate([
            'cancellation_reason' => 'required|string|max:500',
        ]);

        DB::transaction(function () use ($order, $request) {
            $oldStatus      = $order->status;
            $order->status  = 'cancelled';
            $order->cancellation_reason = $request->cancellation_reason;
            $order->save();

            // Catat ke log — customer yang cancel tetap dicatat
            $order->statusLogs()->create([
                'admin_id'   => $request->user()->id,
                'old_status' => $oldStatus,
                'new_status' => 'cancelled',
            ]);
        });

        if ($request->user()->email) {
            Mail::to($request->user()->email)->queue(
                new OrderNotification($order, 'cancelled')
            );
        }

        return response()->json(['message' => 'Pesanan berhasil dibatalkan.']);
    }

    // --------------------------------------------------------
    // PRIVATE: Format order untuk response ke React
    // Konsisten antara active(), history(), show(), store()
    // --------------------------------------------------------
    private function formatOrder(Order $order): array
    {
        // Label harga: estimasi sebelum processing, final setelah processing
        $isPriceEstimate = !in_array($order->status, [
            'processing', 'ready', 'delivered'
        ]);

        return [
            'id'                  => $order->id,
            'order_code'          => $order->order_code,
            'customer_name'       => $order->customer_name,
            'pickup_date'         => $order->pickup_date,
            'delivery_date'       => $order->delivery_date,
            'duration_days'       => $order->duration_days,
            'status'              => $order->status,
            'payment_status'      => $order->payment_status,
            'total_price'         => $order->total_price,
            'price_label'         => $isPriceEstimate ? 'Estimasi' : 'Total',
            'note'                => $order->note,
            'cancellation_reason' => $order->cancellation_reason,
            'created_at'          => $order->created_at,

            'address' => $order->address ? [
                'city_name'     => $order->address->city_name,
                'district_name' => $order->address->district_name,
                'village_name'  => $order->address->village_name,
                'detail'        => $order->address->detail,
            ] : null,

            'items' => $order->items->map(fn($item) => [
                'id'           => $item->id,
                'service_name' => $item->service_name,
                'quantity'     => $item->quantity,
                'price'        => $item->price,
                'subtotal'     => $item->subtotal,
            ]),
        ];
    }

    // --------------------------------------------------------
    // PRIVATE: Generate kode order unik
    // Format: ORD-20240601-X7K2
    // --------------------------------------------------------
    private function generateOrderCode(): string
    {
        do {
            $code = 'ORD-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -4));
        } while (Order::where('order_code', $code)->exists());

        return $code;
    }

    // GET /customer/orders/{code}
}