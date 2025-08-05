<?php

namespace App\Http\Controllers\Approver;

use App\Http\Controllers\Controller;
use App\Models\PurchaseRequest;
use App\Models\RFQ;
use App\Models\RFQDetail;
use App\Models\Supplier;
use App\Notifications\PurchaseRequestApproved;
use Exception;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\ValidationException;

class ApproverController extends Controller
{
    public function dashboard(){
        return Inertia::render('BacApprover/Dashboard',[

        ]);
    }

public function purchase_requests(Request $request)
{
    $query = PurchaseRequest::with(['details', 'division', 'focal_person']);

    if ($request->filled('prNumber')) {
        $query->where('pr_number', 'like', '%' . $request->input('prNumber') . '%');
    }

    if ($request->filled('focalPerson')) {
        $query->whereHas('focal_person', function ($q) use ($request) {
            $q->where('firstname', 'like', '%' . $request->input('focalPerson') . '%')
            ->orWhere('lastname', 'like', '%' . $request->input('focalPerson') . '%');
        });
    }

    if ($request->filled('division')) {
        $query->where('division_id', $request->input('division'));
    }

    $purchaseRequests = $query->latest()->paginate(10)->withQueryString();

    return Inertia::render('BacApprover/PurchaseRequests', [
        'purchaseRequests' => $purchaseRequests,
        'filters' => $request->only(['prNumber', 'focalPerson', 'division']),
    ]);
}

    public function for_review()
    {
        $sentPRs = PurchaseRequest::with(['details', 'division', 'focal_person'])
                        ->where('is_sent', 1)
                        ->get();

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
            if ($pr->focal_person) {
            $pr->focal_person->notify(new PurchaseRequestApproved($pr));
        }
        } catch (Exception $e) {
            dd($e->getMessage());
        }

        return to_route('bac_approver.for_review')->with('success', "200");
    }

    public function show_details($id)
    {
        $pr = PurchaseRequest::with(['details.product.unit', 'division', 'focal_person'])
            ->findOrFail($id);

        return Inertia::render('BacApprover/ViewDetails', [
            'pr' => [
                
                'id' => $pr->id,
                'focal_person' => $pr->focal_person,
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
    public function approved_requests(){
        $purchaseRequests = PurchaseRequest::with(['details', 'division', 'focal_person', 'rfqs'])->where('status', 'Approved')
                        ->get();

        return Inertia::render('BacApprover/Approved', [
            'purchaseRequests' => $purchaseRequests,
        ]);
    }
    


public function store_rfq(Request $request)
{
    $validated = $request->validate([
        'pr_id' => 'required|integer|exists:tbl_purchase_requests,id',
        'user_id' => 'required|integer|exists:users,id',
        'selections' => 'array',
        'selections.*.pr_detail_id' => 'required|integer|exists:tbl_pr_details,id',
        'selections.*.supplier_id' => 'required|integer|exists:tbl_suppliers,id',
        'selections.*.estimated_bid' => 'required|numeric|min:0',
    ]);
    // Create RFQ if not exists
    $rfq = RFQ::firstOrCreate([
        'pr_id' => $validated['pr_id'],
        'user_id' => $validated['user_id'],
    ]);

    foreach ($validated['selections'] as $selection) {
        // Allow same item but different supplier
        $exists = RFQDetail::where('rfq_id', $rfq->id)
            ->where('pr_details_id', $selection['pr_detail_id'])
            ->where('supplier_id', $selection['supplier_id'])
            ->exists();

        if (!$exists) {
            RFQDetail::create([
                'rfq_id' => $rfq->id,
                'pr_details_id' => $selection['pr_detail_id'],
                'supplier_id' => $selection['supplier_id'],
                'estimated_bid' => $selection['estimated_bid'],
            ]);
        }
    }

    return redirect()->back()->with('success', 'RFQ submitted successfully!')->with('reload', true);
}


    public function generate_rfq($id)
{
    $pr = PurchaseRequest::with(['details.product.unit', 'division', 'focal_person'])
        ->findOrFail($id);

    $suppliers = Supplier::all();

    $rfqs = RFQ::with([
        'details.supplier',
        'details.prDetail.product'
    ])->where('pr_id', $id)->get();


    return Inertia::render('BacApprover/GenerateRFQ', [
        'purchaseRequest' => $pr,
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
        'suppliers' => $suppliers,
        'rfqs' => $rfqs,
    ]);
}


    public function print_rfq($id)
    {
        $rfq = RFQ::with(['details.supplier', 'purchaseRequest.details.product.unit'])->findOrFail($id);


        $details = $rfq->purchaseRequest->details->map(function ($detail) {
            return [
                'id' => $detail->id,
                'item' => $detail->product->name ?? '',
                'specs' => $detail->product->specs ?? '',
                'unit' => $detail->product->unit->unit ?? '',
                'quantity' => $detail->quantity,
                'unit_price' => $detail->unit_price,
                'total_price' => $detail->quantity * $detail->unit_price,
            ];
        });

        return Inertia::render('BacApprover/PrintRfq', [
            'rfq' => $rfq,
            'details' => $details,
        ]);
    }

    public function for_quotations()
    {
        $purchaseRequests = PurchaseRequest::with(['details', 'division', 'focal_person'])
            ->where('status', 'Approved')
            ->whereHas('rfqs')
            ->get();

        return Inertia::render('BacApprover/Quotations', [
            'purchaseRequests' => $purchaseRequests,
        ]);
    }


    public function quoted_price($id)
{
    $pr = PurchaseRequest::with(['details.product.unit', 'division', 'focal_person'])
        ->findOrFail($id);


    $rfqs = RFQ::with('details.supplier')->where('pr_id', $id)->get();


    $supplierIds = $rfqs->flatMap(function ($rfq) {
        return $rfq->details->pluck('supplier_id');
    })->unique()->filter()->values(); 


    $suppliers = Supplier::whereIn('id', $supplierIds)->get();

    $rfqDetails = $rfqs->flatMap(function ($rfq) {
        return $rfq->details->map(function ($detail) use ($rfq) {
            return [
                'rfq_id' => $rfq->id,
                'pr_details_id' => $detail->pr_details_id,
                'supplier_id' => $detail->supplier_id,
                'quoted_price' => $detail->quoted_price,
            ];
        });
    });

    return Inertia::render('BacApprover/EnterQuotedPrice', [
        'purchaseRequest' => $pr,
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
        'suppliers' => $suppliers,
        'rfqs' => $rfqs,
        'rfq_details' => $rfqDetails->values(),
    ]);
}


public function submit_quoted(Request $request)
{
    // For JSON data, validate this way
    $data = $request->validate([
        'rfq_id' => ['required', 'exists:tbl_rfqs,id'],
        'pr_details_id' => ['required', 'exists:tbl_pr_details,id'],
        'supplier_id' => ['required', 'exists:tbl_suppliers,id'],
        'quoted_price' => ['nullable', 'numeric', 'min:0'],
    ]);
    RFQDetail::updateOrCreate(
        [
            'rfq_id' => $data['rfq_id'],
            'pr_details_id' => $data['pr_details_id'],
            'supplier_id' => $data['supplier_id'],
        ],
        [
            'quoted_price' => $data['quoted_price'],
        ]
    );

    return back()->with('success', 'Quoted price submitted successfully.');
}


    public function abstract_of_quotations($prId)
    {
        $rfq = RFQ::with([
            'purchaseRequest.focal_person',
            'purchaseRequest.division',
            'purchaseRequest.details',
        ])->where('pr_id', $prId)->firstOrFail();

        // Get RFQ details with supplier info
        $rfqDetails = RFQDetail::with('supplier')
            ->where('rfq_id', $rfq->id)
            ->get()
            ->groupBy('pr_details_id');

        return Inertia::render('BacApprover/AbstractOfQuotations', [
            'rfq' => $rfq,
            'groupedDetails' => $rfqDetails,
        ]);
    }
    public function markWinner($id)
    {
        $rfqDetail = RFQDetail::findOrFail($id);

        // Optional: Unmark all previous winners for the same PR Detail
        RFQDetail::where('pr_details_id', $rfqDetail->pr_detail_id)->update(['is_winner' => false]);

        // Mark selected as winner
        $rfqDetail->is_winner = true;
        $rfqDetail->save();

        return back()->with('success', 'Supplier marked as winner.');
    }

public function printAOQ($id, $pr_detail_id)
{
    $rfq = RFQ::with(['purchaseRequest.details', 'details.supplier'])->findOrFail($id);
    $prDetail = $rfq->purchaseRequest->details->firstWhere('id', $pr_detail_id);

    $top3 = $rfq->details
        ->where('pr_details_id', $pr_detail_id)
        ->sortBy('quoted_price')
        ->take(3)
        ->values(); // Ensure it resets keys (for Vue)

    return Inertia::render('BacApprover/PrintAOQ', [
        'rfq' => $rfq,
        'prDetail' => $prDetail,
        'top3' => $top3
    ]);
}


}