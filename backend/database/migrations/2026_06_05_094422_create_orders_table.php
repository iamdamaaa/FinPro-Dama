<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->restrictOnDelete()->cascadeOnUpdate();
            $table->foreignId('address_id')->constrained('user_addresses')->restrictOnDelete()->cascadeOnUpdate();
            $table->string('customer_name');
            $table->string('order_code', 50)->unique();
            $table->unsignedTinyInteger('duration_days'); 
            $table->date('pickup_date');
            $table->date('delivery_date');
            $table->enum('status', ['pending', 'picked_up', 'processing', 'ready', 'delivered', 'cancelled'])->default('pending');
            $table->enum('payment_status', ['unpaid', 'paid', 'refunded'])->default('unpaid');
            $table->text('note')->nullable();
            $table->text('cancellation_reason')->nullable();
            $table->decimal('total_price', 14, 2)->default(0.00);
            $table->timestamps();
        });

        \DB::statement('ALTER TABLE orders ADD CONSTRAINT chk_duration_days CHECK (duration_days IN (1, 2, 3))');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
