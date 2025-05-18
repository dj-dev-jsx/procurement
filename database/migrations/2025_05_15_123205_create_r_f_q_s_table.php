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
        Schema::create('tbl_rfqs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('pr_id')->constrained('tbl_purchase_requests')->restrictOnDelete();
            $table->decimal('estimated_bid', 10, 2);
            $table->foreignId('awarded_supplier_id')->constrained('tbl_suppliers')->restrictOnDelete();
            $table->boolean('is_winner');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tbl_rfqs');
    }
};
