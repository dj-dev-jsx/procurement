import ApproverLayout from "@/Layouts/ApproverLayout";
import { Head, router } from "@inertiajs/react";

export default function AbstractOfQuotations({ rfq, groupedDetails = {} }) {
  const pr = rfq.purchase_request;

  /**
   * Generates the URL to print the AOQ.
   * Can operate in 'full PR' mode or 'per-item' mode.
   */
  const handlePrintAOQ = (rfqId, prDetailId = null) => {
    const routeName = "bac_approver.print_aoq";
    const params = prDetailId ? { id: rfqId, pr_detail_id: prDetailId } : { id: rfqId };
    window.open(route(routeName, params), "_blank");
  };

  /**
   * Marks a supplier as the winner.
   * If prDetailId is provided, it marks the winner for a single item.
   * Otherwise, it marks the supplier as the winner for the entire PR.
   */
  const handleMarkWinner = (rfqId, supplierId, prDetailId = null) => {
    // Add a confirmation dialog before proceeding
    const confirmationMessage = prDetailId
      ? "Are you sure you want to mark this supplier as the winner for this item?"
      : "Are you sure you want to mark this supplier as the winner for the entire Purchase Request?";

    if (window.confirm(confirmationMessage)) {
      const routeName = "bac_approver.mark_winner";
      const params = prDetailId ? { id: rfqId, pr_detail_id: prDetailId } : { id: rfqId };
      router.post(route(routeName, params), {
        supplier_id: supplierId
      }, {
        preserveScroll: true // Keep the user's scroll position after the action
      });
    }
  };


  // --- Data Processing: Determine Full-Bid Suppliers ---

  // 1. Build a map of suppliers and the items they quoted for.
  const supplierMap = {}; // supplierId => { supplier, detailIds: Set, total, isWinner }
  pr.details.forEach((detail) => {
    const quotesForItem = groupedDetails[detail.id] || [];

    quotesForItem.forEach((quote) => {
      const sid = quote.supplier.id;
      if (!supplierMap[sid]) {
        supplierMap[sid] = { supplier: quote.supplier, detailIds: new Set(), total: 0, isWinner: false };
      }
      supplierMap[sid].detailIds.add(detail.id);
      supplierMap[sid].total += parseFloat(quote.quoted_price || 0);
      if (quote.is_winner) supplierMap[sid].isWinner = true;
    });
  });

  // 2. A "full-bid" supplier is one who quoted for every single item in the PR.
  const totalDetailsCount = pr.details.length;
  const fullBidSuppliers = Object.values(supplierMap).filter(s => s.detailIds.size === totalDetailsCount);

  // 3. Determine which mode to render.
  const hasFullBids = fullBidSuppliers.length > 0;
  const isFullPrWinnerDeclared = fullBidSuppliers.some(s => s.isWinner);


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

        {/* ==================================================================== */}
        {/* MODE 1: FULL PR AWARDING                                           */}
        {/* Render this view if at least one supplier quoted for ALL items.    */}
        {/* ==================================================================== */}
        {hasFullBids ? (
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
                      {/* Show the button only if NO winner has been declared for the full PR yet */}
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
          /* ==================================================================== */
          /* MODE 2: PER-ITEM AWARDING                                          */
          /* Render this view if NO supplier quoted for all items.              */
          /* ==================================================================== */
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
                          {/* Show button only if NO winner has been declared for THIS ITEM yet */}
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