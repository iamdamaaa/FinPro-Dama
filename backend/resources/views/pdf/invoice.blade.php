<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: Arial, sans-serif;
            font-size: 10px;
            color: #000;
            width: 100%;
            padding: 8px;
        }

        /* Header toko */
        .header {
            text-align: center;
            border-bottom: 1px dashed #000;
            padding-bottom: 6px;
            margin-bottom: 6px;
        }

        .header h1 {
            font-size: 14px;
            font-weight: bold;
        }

        .header p {
            font-size: 9px;
            color: #444;
        }

        /* QR Code */
        .qr-section {
            text-align: center;
            margin: 6px 0;
        }

        .qr-section img {
            width: 80px;
            height: 80px;
        }

        .qr-section p {
            font-size: 8px;
            color: #666;
            margin-top: 2px;
        }

        /* Info pesanan */
        .section {
            margin-bottom: 6px;
        }

        .section-title {
            font-weight: bold;
            font-size: 9px;
            border-bottom: 1px solid #000;
            padding-bottom: 2px;
            margin-bottom: 4px;
            text-transform: uppercase;
        }

        .info-row {
            display: table;
            width: 100%;
            margin-bottom: 2px;
        }

        .info-label {
            display: table-cell;
            width: 45%;
            color: #444;
        }

        .info-value {
            display: table-cell;
            width: 55%;
            font-weight: bold;
        }

        /* Tabel item */
        table {
            width: 100%;
            border-collapse: collapse;
        }

        table th {
            font-size: 9px;
            text-align: left;
            border-bottom: 1px solid #000;
            padding: 2px 0;
        }

        table td {
            font-size: 9px;
            padding: 2px 0;
            vertical-align: top;
        }

        .text-right {
            text-align: right;
        }

        /* Total */
        .total-section {
            border-top: 1px dashed #000;
            margin-top: 4px;
            padding-top: 4px;
        }

        .total-row {
            display: table;
            width: 100%;
        }

        .total-label {
            display: table-cell;
            font-weight: bold;
        }

        .total-value {
            display: table-cell;
            text-align: right;
            font-weight: bold;
            font-size: 11px;
        }

        /* Catatan */
        .note-section {
            border-top: 1px dashed #000;
            margin-top: 6px;
            padding-top: 4px;
            font-size: 9px;
            color: #444;
        }

        /* Footer */
        .footer {
            text-align: center;
            margin-top: 8px;
            border-top: 1px dashed #000;
            padding-top: 6px;
            font-size: 9px;
            color: #666;
        }
    </style>
</head>
<body>

    {{-- HEADER --}}
    <div class="header">
        <h1>Anjem Laundry</h1>
        <p>Pickup & Delivery Laundry</p>
    </div>

    {{-- QR CODE --}}
    <div class="qr-section">
        <img src="{{ $qrBase64 }}" alt="QR Pesanan">
        <p>Scan untuk cek detail pesanan</p>
    </div>

    {{-- INFO PESANAN --}}
    <div class="section">
        <div class="section-title">Info Pesanan</div>

        <div class="info-row">
            <span class="info-label">No. Order</span>
            <span class="info-value">{{ $order->order_code }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Nama</span>
            <span class="info-value">{{ $order->customer_name }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Tanggal Pickup</span>
            <span class="info-value">
                {{ \Carbon\Carbon::parse($order->pickup_date)->format('d/m/Y') }}
            </span>
        </div>
        <div class="info-row">
            <span class="info-label">Estimasi Selesai</span>
            <span class="info-value">
                {{ \Carbon\Carbon::parse($order->delivery_date)->format('d/m/Y') }}
            </span>
        </div>
        <div class="info-row">
            <span class="info-label">Durasi</span>
            <span class="info-value">{{ $order->duration_days }} Hari</span>
        </div>
    </div>

    {{-- ALAMAT --}}
    <div class="section">
        <div class="section-title">Alamat Pickup</div>
        <p>
            {{ $order->address->detail }},
            {{ $order->address->village_name }},
            {{ $order->address->district_name }},
            {{ $order->address->city_name }}
        </p>
    </div>

    {{-- DETAIL ITEM --}}
    <div class="section">
        <div class="section-title">Detail Layanan</div>
        <table>
            <thead>
                <tr>
                    <th>Layanan</th>
                    <th class="text-right">Qty</th>
                    <th class="text-right">Harga</th>
                    <th class="text-right">Subtotal</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($order->items as $item)
                <tr>
                    <td>{{ $item->service_name }}</td>
                    <td class="text-right">{{ $item->quantity }}</td>
                    <td class="text-right">
                        Rp {{ number_format($item->price, 0, ',', '.') }}
                    </td>
                    <td class="text-right">
                        Rp {{ number_format($item->subtotal, 0, ',', '.') }}
                    </td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>

    {{-- TOTAL --}}
    <div class="total-section">
        <div class="total-row">
            <span class="total-label">
                {{-- Label berubah tergantung status --}}
                @if(in_array($order->status, ['processing', 'ready', 'delivered']))
                    Total
                @else
                    Estimasi Total
                @endif
            </span>
            <span class="total-value">
                Rp {{ number_format($order->total_price, 0, ',', '.') }}
            </span>
        </div>
    </div>

    {{-- CATATAN --}}
    @if($order->note)
    <div class="note-section">
        <strong>Catatan:</strong><br>
        {{ $order->note }}
    </div>
    @endif

    {{-- FOOTER --}}
    <div class="footer">
        <p>Terima kasih telah menggunakan Anjem Laundry</p>
        <p>Dicetak: {{ now()->format('d/m/Y H:i') }}</p>
    </div>

</body>
</html>