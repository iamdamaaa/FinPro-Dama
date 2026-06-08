<?php

namespace App\Services;

use App\Models\Order;
use Barryvdh\DomPDF\Facade\Pdf;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class InvoiceService
{
    // --------------------------------------------------------
    // Generate PDF nota thermal 80mm
    // Dipanggil dari:
    //   - AdminOrderController@invoice (download langsung)
    //   - OrderNotification mail (link di email user)
    // --------------------------------------------------------
    public static function generatePdf(Order $order)
    {
        // Pastikan relasi sudah di-load
        $order->loadMissing(['items', 'address', 'user']);

        // Generate QR Code sebagai base64
        // URL yang di-encode: link halaman detail pesanan
        $frontendUrl = config('app.frontend_url');
        $qrUrl       = $frontendUrl . '/orders/' . $order->order_code;
        $qrImage     = QrCode::format('png')->size(150)->generate($qrUrl);
        $qrBase64    = 'data:image/png;base64,' . base64_encode($qrImage);

        // Kirim data ke Blade template
        $data = [
            'order'    => $order,
            'qrBase64' => $qrBase64,
        ];

        // Load view dan set ukuran kertas thermal 80mm
        // 80mm = 226.77pt, tinggi dibuat panjang agar konten tidak terpotong
        $pdf = Pdf::loadView('invoice.nota', $data)
                  ->setPaper([0, 0, 226.77, 800], 'portrait');

        return $pdf;
    }
}