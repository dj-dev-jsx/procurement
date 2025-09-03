<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Abstract of Quotation - Item</title>
    <style>
        body { font-family: "Times New Roman", serif; font-size: 13px; line-height: 1.3; color: #000; margin: 40px; }
        .center { text-align: center; }
        .bold { font-weight: bold; }
        .italic { font-style: italic; }
        .uppercase { text-transform: uppercase; }
        table { border-collapse: collapse; width: 100%; font-size: 12px; text-align: center; margin-bottom: 20px; }
        th, td { border: 1px solid #000; padding: 4px 6px; }
        footer { font-size: 11px; color: #555; display: flex; justify-content: space-between; margin-top: 50px; }
    </style>
</head>
<body>
    <div class="center">
        <img src="{{ public_path('deped1.png') }}" alt="DepEd Logo" style="width:70px; height:auto; margin-bottom:10px;">
        <h2 class="uppercase bold" style="font-size:14px;">Republic of the Philippines</h2>
        <h3 class="uppercase bold" style="font-size:13px;">Department of Education</h3>
        <p class="uppercase bold" style="font-size:12px;">
            REGION II – CAGAYAN VALLEY<br>
            SCHOOLS DIVISION OFFICE OF THE CITY OF ILAGAN
        </p>
        <h3 class="uppercase bold" style="margin-top:15px; font-size:13px;">ABSTRACT OF QUOTATIONS</h3>
        <p class="italic" style="font-size:12px;">(As Calculated Bid Price)</p>
    </div>

    <div style="font-size:12px; margin:15px 0;">
        <p><strong>Lot No.:</strong> _____________</p>
        <p><strong>Date of Opening:</strong> _____________</p>
        <p><strong>Venue:</strong> _____________</p>
    </div>

    <table>
        <thead style="background:#f2f2f2;">
            <tr>
                <th style="width:8%;">No.</th>
                <th>Name of Contractor / Offeror</th>
                <th>Total Quotations</th>
                <th>Remarks</th>
            </tr>
        </thead>
        <tbody>
            @foreach($top3 as $idx => $detail)
                <tr>
                    <td>{{ $idx+1 }}</td>
                    <td>{{ $detail['supplier']->company_name }}</td>
                    <td>
                        ₱{{ number_format($detail['total_amount'], 2) }}
                    </td>
                    <td>{{ !empty($detail['is_winner']) ? "Winner" : "" }}</td>



                </tr>
            @endforeach
            {{-- filler rows --}}
            @for($i = count($top3); $i < 3; $i++)
                <tr>
                    <td>{{ $i+1 }}</td>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                </tr>
            @endfor
        </tbody>
    </table>

    <p style="font-size:12px; margin-top:10px;">
        Awarded to: 
        <span style="text-decoration:underline; font-weight:bold;">
            {{ is_array($top3[0]) 
                ? $top3[0]['supplier']->company_name 
                : $top3[0]->supplier->company_name }}
        </span>
        offering the <em>Approved Bid</em>.
    </p>



    <div style="margin-top:40px; font-size:12px;">
        <p><strong>Prepared by:</strong></p>
        <p style="margin-top:20px; text-decoration:underline;">BAC Secretariat - Member</p>
    </div>

    <div style="margin-top:60px; font-size:12px;">
        <p class="bold center" style="margin-bottom:15px;">BIDS AND AWARDS COMMITTEE</p>
        <table style="border:none; text-align:center; margin:0 auto;">
            <tr>
                <td style="border:none; width:33%;">BAC Member</td>
                <td style="border:none; width:33%;">BAC Member</td>
                <td style="border:none; width:33%;">BAC Member</td>
            </tr>
            <tr>
                <td style="border:none;"></td>
                <td style="border:none;">Vice Chairperson</td>
                <td style="border:none;"></td>
            </tr>
            <tr>
                <td colspan="3" style="border:none; padding-top:40px;">BAC Chairperson</td>
            </tr>
        </table>
    </div>

    <footer>
        <div>ASDS-QF-003</div>
        <div>Rev:00</div>
    </footer>
</body>
</html>
