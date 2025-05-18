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
        Schema::create('tbl_iar', function (Blueprint $table) {
            $table->id();
            $table->foreignId('po_id')->constrained('tbl_purchase_orders')->restrictOnDelete();
            $table->string('iar_number', 20);
            $table->string('item_desc', 255);
            $table->foreignId('unit')->constrained('tbl_units')->restrictOnDelete();
            $table->decimal('quantity_ordered', 10, 2);
            $table->decimal('quantity_recieved', 10, 2);
            $table->decimal('unit_price', 10, 2);
            $table->decimal('total_price', 10, 2);
            $table->text('remarks');
            $table->string('inspected_by', 100);
            $table->date('date_recieved');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tbl_iar');
    }
};
