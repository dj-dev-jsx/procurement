<?php

namespace App\Http\Controllers\Approver;

use App\Http\Controllers\Controller;
use App\Models\PurchaseRequest;
use Exception;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ApproverController extends Controller
{
    public function dashboard(){
        return Inertia::render('BacApprover/Dashboard',[

        ]);
    }

    public function purchase_requests(){
        return Inertia::render('BacApprover/PurchaseRequests', [

        ]);
    }

    public function for_review(){
            $sentPRs = PurchaseRequest::where('is_sent', 1)->with('details')->get();
        return Inertia::render('BacApprover/ForReview', [
            'sentPurchaseRequests' => $sentPRs,
        ]);
    }
    public function approve(PurchaseRequest $pr)
    {
        try {
            $pr->update([
                'status' => 'Approved',
            ]);
        } catch (Exception $e) {
            dd($e->getMessage());
        }

        return to_route('bac_approver.for_review')->with('success', "200");
    }

    public function show_details($id)
    {
        $pr = PurchaseRequest::with(['details.product.unit', 'division', 'requestedBy'])
            ->findOrFail($id);

        return Inertia::render('BacApprover/ViewDetails', [
            'pr' => [
                'id' => $pr->id,
                'pr_number' => $pr->pr_number,
                'purpose' => $pr->purpose,
                'status' => $pr->status,
                'approval_image' => $pr->approval_image,
                'created_at' => $pr->created_at,
                'requester_name' => $pr->requested_by ?? 'N/A',
                'division' => $pr->division->division ?? 'N/A',
                'details' => $pr->details->map(function ($detail) {
                    return [
                        'id' => $detail->id,
                        'item' => $detail->product->name ?? '',
                        'specs' => $detail->product->specs ?? '',
                        'unit' => $detail->product->unit->unit ?? '',
                        'quantity' => $detail->quantity,
                        'unit_price' => $detail->unit_price,
                        'total_price' => $detail->quantity * $detail->unit_price,
                    ];
                }),
            ],
        ]);
    }
}
