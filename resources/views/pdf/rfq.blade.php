<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Request for Quotation</title>
  <style>
    body { font-family: "Times New Roman", serif; font-size: 13px; line-height: 1.2; color:#000; }
    h2, h3 { margin: 0; padding: 0; font-weight: bold; text-transform: uppercase; }
    /* Adjusted font size for h2 */
    h2 { font-size: 14px; } /* You can make this even smaller if needed */
    h3 { font-size: 13px; } /* Optionally adjust h3 as well */
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .text-left { text-align: left; }
    .underline { text-decoration: underline; }
    .italic { font-style: italic; }
    .font-bold { font-weight: bold; }
    .table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 10px; }
    .table th, .table td { border: 1px solid #000; padding: 4px; }
  </style>
</head>
<body>

<div class="text-center">
    <img src="{{ public_path('/deped1.png') }}" alt="DepEd Logo" style="width:60px; margin-bottom:5px;"> <!-- Reduced image width and margin -->
    <h2>
      Republic of the Philippines<br>
      Department of Education<br>
      Region II – Cagayan Valley<br>
      Schools Division Office of the City of Ilagan
    </h2>
    <div style="margin:3px 0;">________________________________________________________________________________________________</div> <!-- Reduced margin -->
    <h3>Bids and Awards Committee</h3>
    <h3>Request for Quotation</h3>
</div>

<div class="text-right" style="margin-top:20px;">
  <p class="underline"><strong>BAC CN# _______</strong></p>
  <p><strong>Date: ________</strong></p>
</div>

<div style="margin-top:20px;">
  <p class="underline"><strong>To all Eligible Suppliers:</strong></p>
  <ol type="I" style="margin-left:25px;">
    <li>Please quote your lowest price inclusive of VAT on the items listed below, subject to the Terms and Conditions of this RFQ and submit your quotation IN SEALED ENVELOPE duly signed by your representative not later than scheduled opening of quotation on ________________, to the BAC Secretariat at the DepEd City Division Office, Alibagu, Ilagan, Isabela.</li>
    <li>Prospective Supplier shall be responsible to verify/clarify the quoted item/s services at the address and telephone number cited above.</li>
    <li>Supplier with complete quotation and total quotation price is equal or less than the Approved Budget for the Contract shall only be appreciated.</li>
  </ol>
</div>

<div class="text-right" style="margin-top:20px;">
  <p>________________</p>
  <p>BAC Chairperson</p>
</div>

<table class="table text-center">
  <thead>
    <tr>
      <th colspan="3"></th>
      <th>Qty</th>
      <th>Unit</th>
      <th>Estimated Unit Cost</th>
      <th>Bid Price per Unit</th>
      <th colspan="2">Total Bid Price</th>
    </tr>

    @foreach($details as $item)
    <tr>
      <td colspan="3" class="text-left">Services to be provided:</td>
      <td>{{ $item['quantity'] ?? '' }}</td>
      <td>{{ $item['unit'] ?? '' }}</td>
      <td>{{ $item['unit_price'] ?? '' }}</td>
      <td>&nbsp;</td>
      <td colspan="2">&nbsp;</td>
    </tr>
    @endforeach

    <tr>
      <td colspan="3" class="text-left">Location:</td>
      <td colspan="6">&nbsp;</td>
    </tr>
    <tr>
      <td colspan="3" class="text-left">Subject:</td>
      <td colspan="6">&nbsp;</td>
    </tr>
    <tr>
      <td colspan="3" class="text-left">Delivery Period:</td>
      <td colspan="6">&nbsp;</td>
    </tr>
    <tr>
      <td colspan="3" class="text-left">Approved Budget for the Contract ABC:</td>
      <td colspan="6">&nbsp;</td>
    </tr>
  </thead>

  <tbody>
    <tr>
      <td colspan="3" class="font-bold">Item Description</td>
      <td></td><td></td><td>&nbsp;</td><td>&nbsp;</td><td colspan="2">&nbsp;</td>
    </tr>

    @foreach($details as $item)
    <tr>
      <td colspan="3">{{ $item['item'] ?? '' }}</td>
      <td></td><td></td><td>&nbsp;</td><td>&nbsp;</td><td colspan="2">&nbsp;</td>
    </tr>
    @endforeach

    {{-- filler row --}}
    <tr>
      <td colspan="3">&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td colspan="2">&nbsp;</td>
    </tr>

    <tr>
      <td colspan="7" class="text-center font-bold">TOTAL:</td>
      <td class="font-bold"></td>
    </tr>

    <tr>
      <td colspan="3" class="font-bold">SDO City Of Ilagan</td>
      <td colspan="6">&nbsp;</td>
    </tr>

    <tr>
      <td colspan="3" class="font-bold">Supplier's Company Name:</td>
      <td colspan="2">&nbsp;</td>
      <td colspan="2" class="font-bold text-left">TIN:</td>
      <td colspan="2">&nbsp;</td>
    </tr>

    <tr>
      <td colspan="3" class="font-bold">Address:</td>
      <td colspan="6">&nbsp;</td>
    </tr>

    <tr>
      <td colspan="3" class="font-bold">Contact Number:</td>
      <td colspan="2">&nbsp;</td>
      <td colspan="2" class="font-bold text-left">Fax No.</td>
      <td colspan="2" class="font-bold text-left">E-mail:</td>
    </tr>

    <tr>
      <td colspan="3" class="font-bold">Supplier's Authorized Representative Signature Over Printed Name:</td>
      <td colspan="2">&nbsp;</td>
      <td colspan="2" class="font-bold text-left">Date:</td>
      <td colspan="2">&nbsp;</td>
    </tr>

    <tr>
      <td colspan="3" class="font-bold">Canvasser:</td>
      <td colspan="6">&nbsp;</td>
    </tr>
  </tbody>
</table>

<p style="margin-top:30px; text-align:center; font-style:italic;">
  This is to submit our price quotations as indicated above subject to the terms and conditions of this RFQ.
</p>

<div style="margin-top:40px; font-size:11px; display:flex; justify-content:space-between;">
  <div>ASDS-QF-003</div>
  <div>Rev 01</div>
</div>

</body>
</html>