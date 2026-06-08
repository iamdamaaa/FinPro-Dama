<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrderNotification extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Order $order,
        public string $statusKey, // 'pending', 'picked_up', 'processing', dll
    ) {}

    public function envelope(): Envelope
    {
        $subjects = [
            'pending'    => 'Pesanan Diterima - ' . $this->order->order_code,
            'picked_up'  => 'Pesanan Sudah Di-Pickup - ' . $this->order->order_code,
            'processing' => 'Pesanan Sedang Diproses - ' . $this->order->order_code,
            'ready'      => 'Pesanan Siap Diantar - ' . $this->order->order_code,
            'delivered'  => 'Pesanan Selesai - ' . $this->order->order_code,
            'cancelled'  => 'Pesanan Dibatalkan - ' . $this->order->order_code,
        ];

        return new Envelope(
            subject: $subjects[$this->statusKey] ?? 'Update Pesanan - ' . $this->order->order_code,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.order-notification',
            with: [
                'order'     => $this->order,
                'statusKey' => $this->statusKey,
            ],
        );
    }
}