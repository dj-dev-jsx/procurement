<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RequestedBy extends Model
{
    protected $table = 'tbl_requesting_officers';
    public function division()
    {
        return $this->belongsTo(Division::class, 'division_id');
    }
}
