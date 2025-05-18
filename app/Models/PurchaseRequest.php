<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PurchaseRequest extends Model
{
    /** @use HasFactory<\Database\Factories\PurchaseRequestFactory> */
    use HasFactory;
    protected $table = 'tbl_purchase_requests';
    protected $fillable = [

        'pr_number','focal_person', 'division_id', 'purpose', 'requested_by', 'status', 'is_sent', 'approval_image', 
    ];

    public function details()
    {
        return $this->hasMany(PurchaseRequestDetail::class, 'pr_id', 'id');
    }
    public function division()
    {
        return $this->belongsTo(Division::class, 'division_id');
    }
    public function requestedBy()
    {
        return $this->belongsTo(User::class, 'requested_by');
    }



}
