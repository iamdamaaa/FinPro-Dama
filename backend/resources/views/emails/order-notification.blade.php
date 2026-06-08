<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; font-size: 14px; color: #333; }
        .container { max-width: 500px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 16px; border-radius: 8px 8px 0 0; }
        .body { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
        .footer { text-align: center; font-size: 12px; color: #9ca3af; margin-top: 16px; }
        .info-table { width: 100%; border-collapse: collapse; margin: 12px 0; }
        .info-table td { padding: 6px 0; border-bottom: 1px solid #e5e7eb; }
        .info-table td:first-child { color: #6b7280; width: 45%; }
        .info-table td:last-child { font-weight: bold; }
        .total { font-size: 16px; font-weight: bold; color: #2563eb; }
        .badge { display: inline-block; padding: 4px 12px; border-radius: 999px; font-size: 12px; }
        .badge-blue { background: #dbeafe; color: #1d4ed8; }
    </style>
</head>
<body>
<div class="container">

    <div class="header">
        <h2 style="margin:0">Anjem Laundry</h2>
        <p style="margin:4px 0 0">
            @switch($statusKey)
                @case('pending') Pesanan Anda Telah Diterima @break
                @case('picked_up') Pesanan Sudah Di-Pickup @break
                @case('processing') Pesanan Sedang Diproses @break
                @case('ready') Pesanan Siap Diantar @break
                @case('delivered') Pesanan Telah Selesai @break
                @case('cancelled') Pesanan Dibatalkan @break
                @default Update Pesanan
            @endswitch
        </p>
    </div>

    <div class="body">
        <p>Halo, <strong>{{ $order->customer_name }}</strong></p>

        <p>
            @switch($statusKey)
                @case('pending')
                    Pesanan Anda telah kami terima dan sedang menunggu dijemput.
                    @break
                @case('picked_up')
                    Pesanan Anda telah berhasil kami jemput.
                    @break
                @case('processing')
                    Pesanan Anda sedang kami proses. Berikut rincian biaya final.
                    @break
                @case('ready')
                    Pesanan Anda selesai diproses dan siap untuk diantar.
                    @break
                @case('delivered')
                    Pesanan Anda telah selesai diantar. Terima kasih!
                    @break
                @case('cancelled')
                    Pesanan Anda telah dibatalkan.
                    @break
            @endswitch
        </p>

        <table class="info-table">
            <tr>
                <td>No. Order</td>
                <td>{{ $order->order_code }}</td>
            </tr>
            <tr>
                <td>Tanggal Pickup</td>
                <td>{{ \Carbon\Carbon::parse($order->pickup_date)->format('d/m/Y') }}</td>
            </tr>
            <tr>
                <td>Estimasi Selesai</td>
                <td>{{ \Carbon\Carbon::parse($order->delivery_date)->format('d/m/Y') }}</td>
            </tr>
            <tr>
                <td>Durasi</td>
                <td>{{ $order->duration_days }} Hari</td>
            </tr>
            <tr>
                <td>
                    @if(in_array($order->status, ['processing', 'ready', 'delivered']))
                        Total
                    @else
                        Estimasi Total
                    @endif
                </td>
                <td class="total">
                    Rp {{ number_format($order->total_price, 0, ',', '.') }}
                </td>
            </tr>
        </table>

        {{-- Link invoice hanya muncul saat status processing --}}
        @if($statusKey === 'processing')
        <p style="margin-top: 16px;">
            <a href="{{ config('app.frontend_url') }}/orders/{{ $order->order_code }}/invoice"
               style="background:#2563eb;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;">
                Download Invoice
            </a>
        </p>
        @endif

    </div>

    <div class="footer">
        <p>Email ini dikirim otomatis oleh sistem Anjem Laundry.</p>
    </div>

</div>
</body>
</html>