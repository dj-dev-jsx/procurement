<?php

namespace App\Http\Controllers\Requester;

use App\Http\Controllers\Controller;
use App\Http\Requests\PurchaseRequestRequest;
use App\Models\Division;
use App\Models\PurchaseRequest;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use App\Models\Products;
use App\Models\PurchaseRequestDetail;

class RequesterController extends Controller
{
    public function dashboard(){
        return Inertia::render('Requester/Dashboard');
    }


    public function generatePrNumber()
    {
        $year = date('y'); // 2-digit year
        $month = date('m'); // 2-digit month
        $prefix = "PR-$year-$month-";

        // Get last PR number starting with the prefix
        $lastPr = DB::table('tbl_purchase_requests') // or your actual table name
            ->where('pr_number', 'like', $prefix . '%')
            ->orderBy('pr_number', 'desc')
            ->first();

        if ($lastPr) {
            // Extract last 3 digits of serial number
            $lastSerial = intval(substr($lastPr->pr_number, -3));
            $newSerial = str_pad($lastSerial + 1, 3, '0', STR_PAD_LEFT);
        } else {
            $newSerial = '001';
        }

        return $prefix . $newSerial;
    }


    public function create()
    {
        $user = User::with('division')->find(Auth::id());
        $division = Division::with('requestedBy')->find($user->division->id);
        $requestedBy = $division?->requestedBy ?? null;
        $prNumber = $this->generatePrNumber();
        $units = Unit::all();
        

        return Inertia::render('Requester/Create', [
            'units' => $units,
            'requestedBy' => $requestedBy,
            'auth' => ['user' => $user],
            'pr_number' => $prNumber,
        ]);
    }
    public function store(PurchaseRequestRequest $request)
    {
        $data = $request->validated();

        // Create the new purchase request with division_id
        PurchaseRequest::create([
            'focal_person' => $data['focal_person'],
            'pr_number' => $data['pr_number'],
            'purpose' => $data['purpose'],
            'division_id' => $data['division_id'],
            'requested_by' => $data['requested_by']
        ]);

        return redirect()->route('requester.manage_requests')->with('success', 'Purchase Request created!');
    }

    public function manage_requests() {
    $userId = Auth::id();

    $purchaseRequests = PurchaseRequest::with('details.product.unit')
        ->where('focal_person', $userId)
        ->select('id', 'pr_number', 'purpose', 'status', 'is_sent', 'approval_image', 'created_at') // Include missing fields
        ->get();

    $units = Unit::select('id', 'unit')->get();

    $products = Products::with('unit')
        ->select('id', 'name', 'specs', 'unit_id', 'default_price')
        ->get();

    return Inertia::render('Requester/ManageRequests', [
        'purchaseRequests' => $purchaseRequests->map(function ($pr) {
            return [
                'id' => $pr->id,
                'pr_number' => $pr->pr_number,
                'purpose' => $pr->purpose,
                'status' => $pr->status,
                'is_sent' => $pr->is_sent,
                'approval_image' => $pr->approval_image,
                'created_at' => $pr->created_at,
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
            ];
        }),
        'units' => $units,
        'products' => $products,
    ]);
}





    public function store_details(Request $request, $pr_id)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:tbl_products,id',
            'quantity' => 'required|numeric|min:0.01',
            'unit_price' => 'required|numeric|min:0.01',
        ]);

        // Get the product along with its unit relation
        $product = Products::with('unit')->findOrFail($validated['product_id']);

        // Get the associated purchase request
        $purchaseRequest = PurchaseRequest::findOrFail($pr_id);

        // Compute total price
        $unitPrice = $validated['unit_price'];
        $totalPrice = $validated['quantity'] * $unitPrice;


        // Create purchase request detail with snapshot of product info
        $purchaseRequest->details()->create([
            'pr_id' => $purchaseRequest->id,
            'product_id' => $product->id,
            'item' => $product->name,
            'specs' => $product->specs,
            'unit' => $product->unit?->unit ?? 'pcs',
            'quantity' => $validated['quantity'],
            'unit_price' => $unitPrice,
            'total_price' => $totalPrice,
        ]);

        return redirect()->back()->with('success', 'Item added successfully to Purchase Request.');
    }


    public function add_details($pr_id)
    {
        $purchaseRequest = PurchaseRequest::with('details')->select('id', 'pr_number')->findOrFail($pr_id);
        
        // Load details along with their related products and units for easier access
        $purchaseRequest->load(['details.product.unit']);

        $units = Unit::select('id', 'unit')->get();

        $products = Products::with('unit')
                    ->select('id', 'name', 'specs', 'unit_id', 'default_price')
                    ->get();

        return Inertia::render('Requester/AddDetails', [
            'prId' => $purchaseRequest->id,
            'units' => $units,
            'pr_number' => $purchaseRequest->pr_number,
            'products' => $products,
            'prDetails' => $purchaseRequest->details->map(function($detail) {
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
        ]);
    }


    public function print($id)
    {
        $purchaseRequest = PurchaseRequest::with(['details.product.unit'])->findOrFail($id);

        $pr = [
            'id' => $purchaseRequest->id,
            'pr_number' => $purchaseRequest->pr_number,
            'purpose' => $purchaseRequest->purpose,
            'created_at' => $purchaseRequest->created_at,
            'details' => $purchaseRequest->details->map(function ($detail) {
                return [
                    'item' => $detail->product->name ?? '',
                    'specs' => $detail->product->specs ?? '',
                    'unit' => $detail->product->unit->unit ?? '',
                    'quantity' => $detail->quantity,
                    'unit_price' => $detail->unit_price,
                ];
            }),
        ];

        return Inertia::render('Requester/PrintPR', [
            'pr' => $pr,
            'focal_person' => $purchaseRequest->focal_person,
        ]);
    }

    public function sendForApproval(Request $request, $id)
    {
        $request->validate([
            'approval_image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048', // validate image file
        ]);

        $purchaseRequest = PurchaseRequest::findOrFail($id);

        if ($request->hasFile('approval_image')) {
            $image = $request->file('approval_image');
            $filename = time() . '_' . $image->getClientOriginalName();
            $path = $image->storeAs('approval_images', $filename, 'public');

            $purchaseRequest->approval_image = $path;
            $purchaseRequest->is_sent = true;
            $purchaseRequest->save();

            return back()->with('success', 'Purchase request sent for approval with signed image.');
        }

        return back()->withErrors('No image file found.');
    }



}
