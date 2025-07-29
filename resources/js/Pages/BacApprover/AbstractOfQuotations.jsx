import ApproverLayout from "@/Layouts/ApproverLayout";
import { Head, router } from "@inertiajs/react";

export default function AbstractOfQuotations({ rfq, groupedDetails = {} }) {
  const pr = rfq.purchase_request;
  console.log("Grouped Details", groupedDetails);

  const handlePrintAOQ = (rfqId, prDetailId) => {
    window.open(route("bac_approver.print_aoq", { id: rfqId, pr_detail_id: prDetailId }), "_blank");
  };
  const handleMarkAsWinner = (rfqDetailId) => {
  if (confirm("Are you sure you want to mark this supplier as the winner?")) {
    router.post(route("bac_approver.mark_winner", rfqDetailId), {}, {
      preserveScroll: true,
      onSuccess: () => {
        alert("Successfully marked as winner.");
      }
    });
  }
};



  return (
    <ApproverLayout>
      <Head title={`Abstract for ${pr.pr_number}`} />
      <div className="px-8 py-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Abstract of Quotations – PR #{pr.pr_number}
        </h2>
                <div className="mb-4">
          <button
            onClick={() => window.history.back()} // or use window.history.back()
            className="inline-flex items-center px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-md text-sm shadow-sm"
          >
            ← Back
          </button>
        </div>

       

        {pr.details.map((detail) => {
          const top3Details = (groupedDetails[detail.id] || [])
            .slice()
            .sort((a, b) => parseFloat(a.quoted_price) - parseFloat(b.quoted_price))
            .slice(0, 3); // get top 3

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
                  {top3Details.map((rfqDetail, idx) => (
                    <tr key={idx}>
                      <td className="border px-4 py-2">
                        {rfqDetail.supplier.representative_name}
                      </td>
                      <td className="border px-4 py-2">
                        {rfqDetail.supplier.company_name}
                      </td>
                      <td className="border px-4 py-2 text-right">
                        ₱{parseFloat(rfqDetail.quoted_price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="border px-4 py-2 text-center">
                        {rfqDetail.is_winner ? "✔️" : ""}
                      </td>
                      <td className="border px-4 py-2 text-center">
                        {!rfqDetail.is_winner &&
                          top3Details.length === 3 &&
                          !top3Details.some((d) => d.is_winner) && (
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
        })}
      </div>
    </ApproverLayout>
  );
}
