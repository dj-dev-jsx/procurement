<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Request for Quotation</title>
    <style>
        body { font-family: "Times New Roman", serif; font-size: 13px; line-height: 1.2; color: #000; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .text-left { text-align: left; }
        .underline { text-decoration: underline; }
        .font-bold { font-weight: bold; }
        .italic { font-style: italic; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        th, td { border: 1px solid #000; padding: 4px; }
        .border { border: 1px solid #000; }
        .no-border { border: none; }
        .mt-1 { margin-top: 4px; }
        .mt-4 { margin-top: 16px; }
        .mt-6 { margin-top: 24px; }
        .mt-8 { margin-top: 32px; }
        .mb-2 { margin-bottom: 8px; }
        .mb-4 { margin-bottom: 16px; }
    </style>
</head>
<body>
    {{-- Header --}}
    <div class="text-center">
        <img src="{{ $logo }}" alt="DepEd Logo" style="width:80px; height:auto; margin-bottom:10px;">
        <h2 class="font-bold" style="font-size:14px; text-transform:uppercase;">
            Republic of the Philippines <br>
            Department of Education <br>
            Region II – Cagayan Valley <br>
            Schools Division Office of the City of Ilagan
        </h2>
        <div>____________________________________________________________________________________________</div>
        <h3 class="mt-4 font-bold" style="font-size:15px; text-transform:uppercase;">
            Bids and Awards Committee
        </h3>
        <h3 class="mt-1 font-bold" style="font-size:15px; text-transform:uppercase;">
            Request for Quotation
        </h3>
    </div>

    {{-- RFQ Info --}}
    <div class="mt-6 text-right">
        <p class="mb-2 underline"><strong>BAC CN# _______</strong></p>
        <p class="mb-2"><strong>Date _________</strong></p>
    </div>

    {{-- Supplier Instructions --}}
    <div class="mt-6">
        <p class="mb-2 underline"><strong>To all Eligible Suppliers:</strong></p>
        <ol type="I" style="margin-left:20px;">
            <li class="mb-1">
                Please quote your lowest price inclusive of VAT on the items listed below,
                subject to the Terms and Conditions of this RFQ and submit your quotation
                IN SEALED ENVELOPE duly signed by your representative not later than
                scheduled opening of quotation on ________________, to the BAC Secretariat
                at the DepEd City Division Office, Alibagu, Ilagan, Isabela.
            </li>
            <li class="mb-1">
                Prospective Supplier shall be responsible to verify/clarify the quoted
                item/s services at the address and telephone number cited above.
            </li>
            <li class="mb-1">
                Supplier with complete quotation and total quotation price is equal or
                less than the Approved Budget for the Contract shall only be appreciated.
            </li>
        </ol>
    </div>

    {{-- BAC Chair --}}
    <div class="mt-4 text-right">
        <p>________________</p>
        <p>BAC Chairperson</p>
    </div>

    {{-- Table --}}
    <div class="mt-4">
        <table>
            <thead>
                <tr>
                    <th colspan="3"></th>
                    <th>Qty</th>
                    <th>Unit</th>
                    <th>Estimated Unit Cost</th>
                    <th>Bid Price per Unit</th>
                    <th colspan="2">Total Bid Price</th>
                </tr>
                <tr>
                    <td colspan="3" class="text-left">Services to be provided:</td>
                    <td>{{ $detail['quantity'] ?? '' }}</td>
                    <td>{{ $detail['unit'] ?? '' }}</td>
                    <td>{{ number_format($detail['unit_price'] ?? 0, 2) }}</td>
                    <td>&nbsp;</td>
                    <td colspan="2">&nbsp;</td>
                </tr>
                <tr>
                    <td colspan="3" class="text-left">Approved Budget for the Contract ABC:</td>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                    <td colspan="2">&nbsp;</td>
                </tr>
                <tr>
                    <td colspan="3" class="font-bold">Item Description</td>
                    <td colspan="6" class="font-bold">Specifications</td>
                </tr>
                <tr>
                    <td colspan="3" class="text-left" style="vertical-align: top; padding:10px;">
                        {{ $detail['item'] ?? '' }}
                    </td>
                    <td colspan="6" class="text-left" style="vertical-align: top; padding:10px;">
                        {{ $detail['specs'] ?? '' }}
                    </td>
                </tr>
                <tr>
                    <td colspan="9" style="height:30px;">&nbsp;</td>
                </tr>
                <tr>
                    <td colspan="8" class="text-right font-bold">TOTAL:</td>
                    <td class="font-bold">&nbsp;</td>
                </tr>
                <tr>
                    <td colspan="9" class="font-bold text-left">SDO City Of Ilagan</td>
                </tr>
                <tr>
                    <td colspan="3" class="font-bold text-left">Supplier's Company Name:</td>
                    <td colspan="3">{{ $supplier->company_name ?? '' }}</td>
                    <td class="font-bold text-left">TIN:</td>
                    <td colspan="2">{{ $supplier->tin_num ?? '' }}</td>
                </tr>
                <tr>
                    <td colspan="3" class="font-bold text-left">Address:</td>
                    <td colspan="6">{{ $supplier->address ?? '' }}</td>
                </tr>
                <tr>
                    <td colspan="3" class="font-bold text-left">
                        Supplier's Authorized Representative Signature Over Printed Name:
                    </td>
                    <td colspan="3">{{ $supplier->representative_name ?? '' }}</td>
                    <td class="font-bold text-left">Date:</td>
                    <td colspan="2">&nbsp;</td>
                </tr>
                <tr>
                    <td colspan="3" class="font-bold text-left">Canvasser:</td>
                    <td colspan="6">&nbsp;</td>
                </tr>
            </thead>
        </table>
    </div>

    {{-- Footer Note --}}
    <p class="mt-8 text-center italic">
        This is to submit our price quotations as indicated above subject to the terms and conditions of this RFQ.
    </p>

    {{-- Document Footer --}}
    <div class="mt-8" style="display:flex; justify-content:space-between; font-size:11px;">
        <div>ASDS-QF-003</div>
        <div>Rev 01</div>
    </div>
</body>
</html>
