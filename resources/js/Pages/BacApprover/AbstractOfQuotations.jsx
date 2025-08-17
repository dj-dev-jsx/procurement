import ApproverLayout from "@/Layouts/ApproverLayout";
import { Head, router } from "@inertiajs/react";

export default function AbstractOfQuotations({ rfq, groupedDetails = {} }) {
  const pr = rfq.purchase_request;
  console.log(rfq);

const handlePrintAOQ = (rfqId, prDetailId = null) => {
  if (prDetailId) {
    // Per-item mode
    window.open(
      route("bac_approver.print_aoq", { id: rfqId, pr_detail_id: prDetailId }),
      "_blank"
    );
  } else {
    // Full PR mode
    window.open(route("bac_approver.print_aoq", { id: rfqId }), "_blank");
  }
};



const handleMarkWinner = (rfqId, supplierId, prDetailId = null) => {
  if (prDetailId) {
    // Per-item mode
    router.post(route("bac_approver.mark_winner", { id: rfqId, pr_detail_id: prDetailId }), {
      supplier_id: supplierId
    });
  } else {
    // Full PR mode — bulk mark for supplier
    router.post(route("bac_approver.mark_winner", { id: rfqId }), {
      supplier_id: supplierId
    });
  }
};


  // Build supplier map: for each supplier collect the set of detail IDs they quoted and the total quoted amount (one quote per supplier per detail)
  const supplierMap = {}; // supplierId => { supplier, detailIds: Set, total, rfqDetailIds: [], isWinner }
  pr.details.forEach((detail) => {
    const list = groupedDetails[detail.id] || [];

    // ensure one quote per supplier per detail (in case of duplicates)
    const perDetailBySupplier = {};
    list.forEach((rd) => {
      perDetailBySupplier[rd.supplier.id] = rd;
    });

    Object.values(perDetailBySupplier).forEach((rd) => {
      const sid = rd.supplier.id;
      if (!supplierMap[sid]) {
        supplierMap[sid] = { supplier: rd.supplier, detailIds: new Set(), total: 0, rfqDetailIds: [], isWinner: false };
      }
      supplierMap[sid].detailIds.add(detail.id);
      supplierMap[sid].total += parseFloat(rd.quoted_price || 0);
      supplierMap[sid].rfqDetailIds.push(rd.id);
      if (rd.is_winner) supplierMap[sid].isWinner = true;
    });
  });

  // Full-bid suppliers are those whose detailIds size === number of PR details
  const totalDetailsCount = pr.details.length;
  const fullBidSuppliers = Object.values(supplierMap).filter(s => s.detailIds.size === totalDetailsCount);

  const hasFullBids = fullBidSuppliers.length > 0;

  return (
    <ApproverLayout>
      <Head title={`Abstract for ${pr.pr_number}`} />
      <div className="px-8 py-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Abstract of Quotations – PR #{pr.pr_number}
        </h2>

        <div className="mb-4">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-md text-sm shadow-sm"
          >
            ← Back
          </button>
        </div>

        {/* If any supplier quoted for ALL items, render a single PR-level table (one row per full-bid supplier) */}
        {hasFullBids ? (
          <div className="mb-10 border p-4 rounded-lg bg-white shadow-sm">
            <div className="mb-2 text-sm text-gray-700">
              <p><strong>Focal Person:</strong> {pr.focal_person.firstname} {pr.focal_person.lastname}</p>
              <p><strong>Division:</strong> {pr.division.division}</p>
            </div>

            <div className="flex justify-between p-4">
              <h3 className="text-lg font-semibold mb-2"></h3>
              <div>
                <button
                  onClick={() => handlePrintAOQ(rfq.id)}
                  className="text-sm text-white bg-green-600 hover:bg-green-700 px-3 py-1 rounded-md"
                >
                  🖨️ Print
                </button>
              </div>
            </div>

            <table className="w-full text-sm border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-4 py-2 text-left">Supplier Representative</th>
                  <th className="border px-4 py-2 text-left">Company Name</th>
                  <th className="border px-4 py-2 text-right">Quoted Price (Total PR)</th>
                  <th className="border px-4 py-2 text-center">Winner</th>
                  <th className="border px-4 py-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {fullBidSuppliers.map((sEntry) => (
                  <tr key={sEntry.supplier.id}>
                    <td className="border px-4 py-2">{sEntry.supplier.representative_name}</td>
                    <td className="border px-4 py-2">{sEntry.supplier.company_name}</td>
                    <td className="border px-4 py-2 text-right">
                      ₱{parseFloat(sEntry.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="border px-4 py-2 text-center">{sEntry.isWinner ? "✔️" : ""}</td>
                    <td className="border px-4 py-2 text-center">
                      {!sEntry.isWinner && (
                        <button
                          onClick={() => handleMarkWinner(rfq.id, sEntry.supplier.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded"
                        >
                          Mark as Winner
                        </button>
                      )}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Default per-item rendering when no supplier covers all PR items */
          pr.details.map((detail) => {
            const allDetailsSorted = (groupedDetails[detail.id] || [])
              .slice()
              .sort((a, b) => parseFloat(a.quoted_price) - parseFloat(b.quoted_price));

            return (
              <div key={detail.id} className="mb-10 border p-4 rounded-lg bg-white shadow-sm">
                <div className="mb-2 text-sm text-gray-700">
                  <p><strong>Focal Person:</strong> {pr.focal_person.firstname} {pr.focal_person.lastname}</p>
                  <p><strong>Division:</strong> {pr.division.division}</p>
                </div>
                <div className="flex justify-between p-4">
                  <h3 className="text-lg font-semibold mb-2">
                    {detail.item} <span className="text-sm text-gray-500">({detail.specs})</span>
                  </h3>
                  <button
                    onClick={() => handlePrintAOQ(rfq.id, detail.id)}
                    className="text-sm text-white bg-green-600 hover:bg-green-700 px-3 py-1 rounded-md"
                  >
                    🖨️ Print
                  </button>
                </div>

                <table className="w-full text-sm border">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border px-4 py-2 text-left">Supplier Representative</th>
                      <th className="border px-4 py-2 text-left">Company Name</th>
                      <th className="border px-4 py-2 text-right">Quoted Price</th>
                      <th className="border px-4 py-2 text-center">Winner</th>
                      <th className="border px-4 py-2 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allDetailsSorted.map((rfqDetail, idx) => (
                      <tr key={idx}>
                        <td className="border px-4 py-2">{rfqDetail.supplier.representative_name}</td>
                        <td className="border px-4 py-2">{rfqDetail.supplier.company_name}</td>
                        <td className="border px-4 py-2 text-right">
                          ₱{parseFloat(rfqDetail.quoted_price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="border px-4 py-2 text-center">{rfqDetail.is_winner ? "✔️" : ""}</td>
                        <td className="border px-4 py-2 text-center">
                          {!rfqDetail.is_winner && !allDetailsSorted.some((d) => d.is_winner) && (
                            <button
                              onClick={() => handleMarkAsWinner(rfqDetail.id)}
                              className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded"
                            >
                              Mark as Winner
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })
        )}
      </div>
    </ApproverLayout>
  );
}
