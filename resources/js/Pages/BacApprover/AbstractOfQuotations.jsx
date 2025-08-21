import ApproverLayout from "@/Layouts/ApproverLayout";
import { Head, router } from "@inertiajs/react";
import { useState } from 'react';

export default function AbstractOfQuotations({ rfq, groupedDetails = {} }) {
  const pr = rfq.purchase_request;

  const [isPerItemMode, setIsPerItemMode] = useState(false);

  const handlePrintAOQ = (rfqId, prDetailId = null) => {
    const routeName = "bac_approver.print_aoq";
    const params = prDetailId ? { id: rfqId, pr_detail_id: prDetailId } : { id: rfqId };
    window.open(route(routeName, params), "_blank");
  };

  const handleMarkWinner = (rfqId, supplierId, prDetailId = null) => {
    const confirmationMessage = prDetailId
      ? "Are you sure you want to mark this supplier as the winner for this item?"
      : "Are you sure you want to mark this supplier as the winner for the entire Purchase Request?";

    if (window.confirm(confirmationMessage)) {
      const routeName = "bac_approver.mark_winner";
      const params = prDetailId ? { id: rfqId, pr_detail_id: prDetailId } : { id: rfqId };
      router.post(route(routeName, params), {
        supplier_id: supplierId
      }, {
        preserveScroll: true
      });
    }
  };

  // --- CORRECTED DATA PROCESSING ---

  // 1. Build a map of suppliers and their quotes.
  const supplierMap = {}; // { supplierId: { supplier, detailIds, total } }
  const winnerCounts = {}; // { supplierId: count_of_won_items }

  pr.details.forEach((detail) => {
    const quotesForItem = groupedDetails[detail.id] || [];
    quotesForItem.forEach((quote) => {
      const sid = quote.supplier.id;
      if (!supplierMap[sid]) {
        supplierMap[sid] = { supplier: quote.supplier, detailIds: new Set(), total: 0 };
        winnerCounts[sid] = 0; // Initialize winner count for the supplier
      }
      supplierMap[sid].detailIds.add(detail.id);
      supplierMap[sid].total += parseFloat(quote.quoted_price || 0);

      if (quote.is_winner) {
        winnerCounts[sid]++;
      }
    });
  });

  const totalDetailsCount = pr.details.length;

  // 2. Identify suppliers who quoted for all items.
  const fullBidSuppliersData = Object.values(supplierMap).filter(s => s.detailIds.size === totalDetailsCount);

  // 3. Correctly determine if a single supplier has won the entire PR.
  const fullPrWinnerSupplierId = Object.keys(winnerCounts).find(
    sid => winnerCounts[sid] === totalDetailsCount && totalDetailsCount > 0
  );
  const isFullPrWinnerDeclared = !!fullPrWinnerSupplierId;

  // 4. Add the correct winner status to the full bid supplier list for rendering.
  const fullBidSuppliers = fullBidSuppliersData.map(s => ({
    ...s,
    isWinner: s.supplier.id == fullPrWinnerSupplierId
  }));


  const hasFullBids = fullBidSuppliers.length > 0;
  // Determine the effective mode based on state and data
  const showPerItemView = isPerItemMode || !hasFullBids;


  return (
    <ApproverLayout>
      <Head title={`Abstract for ${pr.pr_number}`} />
      <div className="px-8 py-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Abstract of Quotations – PR #{pr.pr_number}
        </h2>

        <div className="mb-4 flex justify-between items-center">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-md text-sm shadow-sm"
          >
            ← Back
          </button>

          {hasFullBids && (
            <div className="flex items-center">
              <span className="mr-3 text-sm font-medium text-gray-900">Award by Entire PR</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPerItemMode}
                  onChange={() => setIsPerItemMode(!isPerItemMode)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
              <span className="ml-3 text-sm font-medium text-gray-900">Award by Item</span>
            </div>
          )}
        </div>

        {!showPerItemView ? (
          // MODE 1: FULL PR AWARDING
          <div className="mb-10 border p-4 rounded-lg bg-white shadow-sm">
            <div className="flex justify-between items-start p-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Comparison for Entire Purchase Request
                </h3>
                <div className="text-sm text-gray-700">
                  <p><strong>Focal Person:</strong> {pr.focal_person.firstname} {pr.focal_person.lastname}</p>
                  <p><strong>Division:</strong> {pr.division.division}</p>
                </div>
              </div>
              <button
                onClick={() => handlePrintAOQ(rfq.id)}
                className="text-sm text-white bg-green-600 hover:bg-green-700 px-3 py-2 rounded-md h-fit"
              >
                🖨️ Print Full AOQ
              </button>
            </div>

            <table className="w-full text-sm border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-4 py-2 text-left">Supplier Representative</th>
                  <th className="border px-4 py-2 text-left">Company Name</th>
                  <th className="border px-4 py-2 text-right">Total Quoted Price</th>
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
                      ₱{sEntry.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="border px-4 py-2 text-center font-bold text-green-600">{sEntry.isWinner ? "✔️" : ""}</td>
                    <td className="border px-4 py-2 text-center">
                      {!isFullPrWinnerDeclared && (
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
          // MODE 2: PER-ITEM AWARDING
          pr.details.map((detail) => {
            const quotesForItem = (groupedDetails[detail.id] || [])
              .slice()
              .sort((a, b) => parseFloat(a.quoted_price) - parseFloat(b.quoted_price));

            const isItemWinnerDeclared = quotesForItem.some(q => q.is_winner);

            return (
              <div key={detail.id} className="mb-10 border p-4 rounded-lg bg-white shadow-sm">
                <div className="flex justify-between items-start p-4">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {detail.item}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">{detail.specs}</p>
                    <div className="text-sm text-gray-700">
                      <p><strong>Focal Person:</strong> {pr.focal_person.firstname} {pr.focal_person.lastname}</p>
                      <p><strong>Division:</strong> {pr.division.division}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handlePrintAOQ(rfq.id, detail.id)}
                    className="text-sm text-white bg-green-600 hover:bg-green-700 px-3 py-2 rounded-md h-fit"
                  >
                    🖨️ Print for this Item
                  </button>
                </div>

                <table className="w-full text-sm border">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border px-4 py-2 text-left">Supplier Representative</th>
                      <th className="border px-4 py-2 text-left">Company Name</th>
                      <th className="border px-4 py-2 text-right">Quoted Price</th>
                      <th className="border px-4 py-2 text-center">Winner</th>
                      <th className="border px-4 py-2 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quotesForItem.map((rfqDetail) => (
                      <tr key={rfqDetail.id}>
                        <td className="border px-4 py-2">{rfqDetail.supplier.representative_name}</td>
                        <td className="border px-4 py-2">{rfqDetail.supplier.company_name}</td>
                        <td className="border px-4 py-2 text-right">
                          ₱{parseFloat(rfqDetail.quoted_price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="border px-4 py-2 text-center font-bold text-green-600">{rfqDetail.is_winner ? "✔️" : ""}</td>
                        <td className="border px-4 py-2 text-center">
                          {!isItemWinnerDeclared && (
                            <button
                              onClick={() => handleMarkWinner(rfq.id, rfqDetail.supplier.id, detail.id)}
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