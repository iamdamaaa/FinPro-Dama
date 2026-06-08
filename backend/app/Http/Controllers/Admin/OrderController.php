<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderStatusLog;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use App\Mail\OrderNotification;
use App\Jobs\SendWhatsAppNotification;
use App\Services\InvoiceService;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class OrderController extends Controller
{
    // --------------------------------------------------------
    // PRIVATE: Generate QR base64 dari order_code
    // --------------------------------------------------------
    private function generateQrBase64(Order $order): string
    {
        $url = config('app.frontend_url') . '/orders/' . $order->order_code;
        $qrSvg = QrCode::format('svg')->size(200)->generate($url);
        return 'data:image/svg+xml;base64,' . base64_encode($qrSvg);
    }

    // --------------------------------------------------------
    // PRIVATE: Format satu order untuk response tabel (index)
    // --------------------------------------------------------
    private function formatForTable(Order $order): array
    {
        return [
            'id'             => $order->id,
            'order_code'     => $order->order_code,
            'customer_name'  => $order->customer_name,
            'pickup_date'    => $order->pickup_date,
            'delivery_date'  => $order->delivery_date,
            'status'         => $order->status,
            'payment_status' => $order->payment_status,
            'total_price'    => $order->total_price,
            'district_name'  => $order->address->district_name ?? '-',
            'qr_base64'      => $this->generateQrBase64($order),
        ];
    }

    // ========================================================
    // GET /api/admin/orders/badge-count
    // ========================================================
    public function badgeCount()
    {
        $count = Order::where('status', 'pending')->count();
        return response()->json(['count' => $count]);
    }

    // ========================================================
    // GET /api/admin/orders
    // ========================================================
    public function index()
    {
        $orders = Order::with(['address'])
                       ->orderBy('created_at', 'desc')
                       ->get();

        $data = $orders->map(fn($order) => $this->formatForTable($order));
        return response()->json($data);
    }

    // ========================================================
    // GET /api/admin/orders/{code}
    // ========================================================
    public function show($code)
    {
        $order = Order::where('order_code', $code)
                      ->with([
                          'items',
                          'address',
                          'user:id,name,email,phone',
                          'statusLogs' => function ($query) {
                              $query->with('admin:id,name')
                                    ->orderBy('created_at', 'asc');
                          },
                      ])
                      ->firstOrFail();

        return response()->json([
            'id'                  => $order->id,
            'order_code'          => $order->order_code,
            'customer_name'       => $order->customer_name,
            'pickup_date'         => $order->pickup_date,
            'delivery_date'       => $order->delivery_date,
            'duration_days'       => $order->duration_days,
            'status'              => $order->status,
            'payment_status'      => $order->payment_status,
            'total_price'         => $order->total_price,
            'note'                => $order->note,
            'cancellation_reason' => $order->cancellation_reason,
            'created_at'          => $order->created_at,
            'qr_base64'           => $this->generateQrBase64($order),

            'address' => $order->address ? [
                'id'            => $order->address->id,
                'city_name'     => $order->address->city_name,
                'district_name' => $order->address->district_name,
                'village_name'  => $order->address->village_name,
                'detail'        => $order->address->detail,
            ] : null,

            'user' => $order->user ? [
                'id'    => $order->user->id,
                'name'  => $order->user->name,
                'email' => $order->user->email,
                'phone' => $order->user->phone,
            ] : null,

            'items' => $order->items->map(fn($item) => [
                'id'           => $item->id,
                'service_id'   => $item->service_id,
                'service_name' => $item->service_name,
                'quantity'     => $item->quantity,
                'price'        => $item->price,
                'subtotal'     => $item->subtotal,
            ]),

            'status_logs' => $order->statusLogs->map(fn($log) => [
                'old_status' => $log->old_status,
                'new_status' => $log->new_status,
                'changed_by' => $log->admin->name ?? '-',
                'changed_at' => $log->created_at,
            ]),
        ]);
    }

    // ========================================================
    // PUT /api/admin/orders/{code}/status
    // ========================================================
    public function updateStatus(Request $request, $code)
    {
        $order = Order::where('order_code', $code)->firstOrFail();

        $request->validate([
            'status' => 'required|in:pending,picked_up,processing,ready,delivered,cancelled',
        ]);

        $oldStatus = $order->status;
        $newStatus = $request->status;

        if ($oldStatus === $newStatus) {
            return response()->json(['message' => 'Status sudah sama.'], 400);
        }

        DB::transaction(function () use ($order, $request, $oldStatus, $newStatus) {
            $order->status = $newStatus;
            $order->save();

            $order->statusLogs()->create([
                'admin_id'   => $request->user()->id,
                'old_status' => $oldStatus,
                'new_status' => $newStatus,
            ]);
        });

        $user  = $order->user;
        $email = $user->email ?? null;
        $phone = $user->phone ?? null;

        match ($newStatus) {
            'picked_up' => $email && Mail::to($email)->queue(
                new OrderNotification($order, 'picked_up')
            ),

            'processing' => (function () use ($order, $email, $phone) {
                if ($email) Mail::to($email)->queue(
                    new OrderNotification($order, 'processing')
                );
                if ($phone) SendWhatsAppNotification::dispatch(
                    $phone,
                    'Pesanan Anda sedang diproses. Biaya final: Rp ' .
                    number_format($order->total_price, 0, ',', '.')
                );
            })(),

            'ready' => $email && Mail::to($email)->queue(
                new OrderNotification($order, 'ready')
            ),

            'delivered' => (function () use ($order, $email, $phone) {
                if ($email) Mail::to($email)->queue(
                    new OrderNotification($order, 'delivered')
                );
                if ($phone) SendWhatsAppNotification::dispatch(
                    $phone,
                    'Pesanan Anda telah selesai diantar. Terima kasih!'
                );
            })(),

            'cancelled' => $email && Mail::to($email)->queue(
                new OrderNotification($order, 'cancelled')
            ),

            default => null,
        };

        return response()->json(['message' => 'Status berhasil diubah.']);
    }

    // ========================================================
    // PUT /api/admin/orders/{code}/payment
    // ========================================================
    public function updatePayment(Request $request, $code)
    {
        $order = Order::where('order_code', $code)->firstOrFail();

        $request->validate([
            'payment_status' => 'required|in:unpaid,paid,refunded',
        ]);

        $order->payment_status = $request->payment_status;
        $order->save();

        return response()->json(['message' => 'Status pembayaran berhasil diubah.']);
    }

    // ========================================================
    // POST /api/admin/orders/{code}/items
    // ========================================================
    public function addItem(Request $request, $code)
    {
        $order = Order::where('order_code', $code)->firstOrFail();

        $request->validate([
            'service_id'   => 'required|exists:services,id',
            'quantity'     => 'required|integer|min:1',
            'custom_price' => 'nullable|numeric|min:0',
        ]);

        $service  = Service::findOrFail($request->service_id);
        $price    = $request->custom_price ?? ($service->price_1day ?? 0);
        $subtotal = $price * $request->quantity;

        DB::transaction(function () use ($order, $service, $request, $price, $subtotal) {
            OrderItem::create([
                'order_id'     => $order->id,
                'service_id'   => $service->id,
                'service_name' => $service->name,
                'quantity'     => $request->quantity,
                'price'        => $price,
                'subtotal'     => $subtotal,
            ]);

            $order->total_price += $subtotal;
            $order->save();
        });

        return response()->json(['message' => 'Item berhasil ditambahkan.']);
    }

    // ========================================================
    // PUT /api/admin/orders/{code}/items/{item}
    // ========================================================
    public function updateItem(Request $request, $code, OrderItem $item)
    {
        $order = Order::where('order_code', $code)->firstOrFail();

        if ($item->order_id !== $order->id) {
            abort(404);
        }

        $request->validate([
            'quantity' => 'required|integer|min:1',
            'price'    => 'required|numeric|min:0',
        ]);

        DB::transaction(function () use ($order, $item, $request) {
            $order->total_price -= $item->subtotal;

            $item->quantity = $request->quantity;
            $item->price    = $request->price;
            $item->subtotal = $request->quantity * $request->price;
            $item->save();

            $order->total_price += $item->subtotal;
            $order->save();
        });

        return response()->json(['message' => 'Item berhasil diperbarui.']);
    }

    // ========================================================
    // DELETE /api/admin/orders/{code}/items/{item}
    // ========================================================
    public function deleteItem(Request $request, $code, OrderItem $item)
    {
        $order = Order::where('order_code', $code)->firstOrFail();

        if ($item->order_id !== $order->id) {
            abort(404);
        }

        DB::transaction(function () use ($order, $item) {
            $order->total_price -= $item->subtotal;
            $order->save();
            $item->delete();
        });

        return response()->json(['message' => 'Item berhasil dihapus.']);
    }

    // ========================================================
    // GET /api/admin/orders/{code}/invoice
    // ========================================================
    public function invoice($code)
    {
        $order = Order::where('order_code', $code)
                      ->with(['items', 'address', 'user'])
                      ->firstOrFail();

        $pdf = InvoiceService::generatePdf($order);

        return $pdf->stream('Nota-' . $order->order_code . '.pdf');
    }
}