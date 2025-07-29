import { useState } from "react";
import {
  ScrollText,
  FilePlus2,
  CheckCircle2,
  Users2,
} from "lucide-react";
import ApproverLayout from "@/Layouts/ApproverLayout";
import { Head, useForm } from "@inertiajs/react";
import Swal from 'sweetalert2';

export default function EnterQuotedPrices({ pr, suppliers, rfqs, purchaseRequest, rfq_details }) {
  const [submittingId, setSubmittingId] = useState(null);
  const [quotedPrices, setQuotedPrices] = useState({});

  const getQuotedPrice = (detailId, supplierId) => {
    const quoted = rfq_details.find(
      (q) => q.pr_details_id === detailId && q.supplier_id === supplierId
    );
    return quoted?.quoted_price ?? null;
  };

  const form = useForm({
    rfq_id: "",
    pr_details_id: "",
    quoted_price: "",
    supplier_id: "",
  });

  const handlePriceChange = (value, detailId, supplierId) => {
    const key = `${detailId}-${supplierId}`;
    setQuotedPrices((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

const handleSubmit = (e, detailId, supplierId) => {
  e.preventDefault();

  const key = `${detailId}-${supplierId}`;
  const quoted_price = quotedPrices[key] === "" ? null : quotedPrices[key];

  const rfqDetail = rfq_details.find(
    (detail) =>
      detail.pr_details_id == detailId && detail.supplier_id == supplierId
  );

  console.log("🔍 detailId:", detailId);
  console.log("🔍 supplierId:", supplierId);
  console.log("🔍 quoted_price:", quoted_price);
  console.log("🔍 rfqDetail:", rfqDetail);

  if (!rfqDetail || !rfqDetail.rfq_id) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "No valid RFQ detail found for this supplier and item.",
    });
    return;
  }

  // ✅ Direct assignment instead of setData()
  form.data.rfq_id = rfqDetail.rfq_id;
  form.data.pr_details_id = detailId;
  form.data.supplier_id = supplierId;
  form.data.quoted_price = quoted_price;

  setSubmittingId(key);

  console.log("🚀 Submitting form data:", form.data);

  form.post(route("bac_approver.submit_quoted"), {
    preserveScroll: true,
    onSuccess: () => {
      setQuotedPrices((prev) => ({ ...prev, [key]: "" }));
      setSubmittingId(null);
      Swal.fire({
        icon: "success",
        title: "Submitted!",
        text: "Quoted price submitted successfully.",
        timer: 1800,
        showConfirmButton: true,
        confirmButtonColor: "#4f46e5",
      });
    },
    onError: (errors) => {
      console.error("❌ Submission errors:", errors);
      setSubmittingId(null);
      Swal.fire({
        icon: "error",
        title: "Oops!",
        text:
          errors?.quoted_price ||
          errors?.rfq_id ||
          errors?.supplier_id ||
          errors?.pr_details_id ||
          "Something went wrong while submitting.",
      });
    },
  });
};






  return (
    <ApproverLayout>
      <Head title="Enter Quoted Prices" />
      <div className="mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <ScrollText className="w-8 h-8 text-indigo-700" />
            Enter Quoted Prices for PR: {pr.pr_number}
          </h1>
        </div>
        <div className="mb-4">
          <button
            onClick={() => window.history.back()} // or use window.history.back()
            className="inline-flex items-center px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-md text-sm shadow-sm"
          >
            ← Back
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* PR Info Panel */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
              <FilePlus2 className="w-5 h-5 text-indigo-600" />
              Purchase Request Info
            </h2>
            <div className="space-y-2 text-sm text-gray-700">
              <div><strong>PR Number:</strong> {pr.pr_number}</div>
              <div><strong>Purpose:</strong> {pr.purpose}</div>
              <div><strong>Requested By:</strong> {pr.requester_name}</div>
              <div><strong>Division:</strong> {pr.division}</div>
              <div><strong>Created:</strong> {new Date(pr.created_at).toLocaleDateString()}</div>
              <div><strong>Focal Person:</strong> {purchaseRequest?.focal_person?.firstname}</div>
            </div>
          </div>

          {/* Quoted Prices Section */}
          <div className="xl:col-span-2 space-y-10">
            {pr.details.map((detail) => (
              <div key={detail.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow">
                <div className="mb-4 border-b pb-3">
                  <h3 className="text-xl font-semibold text-gray-700">
                    {detail.item}
                    <span className="text-sm text-gray-500 ml-2">({detail.specs})</span>
                  </h3>
                  <div className="text-sm text-gray-600 mt-2 grid grid-cols-3 gap-4">
                    <div><strong>Unit:</strong> {detail.unit}</div>
                    <div><strong>Quantity:</strong> {detail.quantity}</div>
                    <div><strong>Est. Price per Unit:</strong> ₱{Number(detail.unit_price || 0).toLocaleString()}</div>
                  </div>
                </div>

                <div className="space-y-6">
                  {suppliers.map((supplier) => {
                    const uniqueId = `${detail.id}-${supplier.id}`;
                    const isSubmitting = submittingId === uniqueId;
                    const quoted = getQuotedPrice(detail.id, supplier.id);
                    const alreadySubmitted = quoted !== null;

                    return (
                      <form
                        key={uniqueId}
                        onSubmit={(e) => handleSubmit(e, detail.id, supplier.id)}
                        className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center"
                      >
                        <div className="md:col-span-4">
                          <p className="font-medium text-gray-800">{supplier.representative_name}</p>
                          <p className="text-xs text-gray-500">{supplier.company_name}</p>
                        </div>

                        <div className="md:col-span-5 relative">
                          <input
                            type="number"
                            step="0.01"
                            placeholder="₱ Quoted Price"
                            required
                            disabled={alreadySubmitted}
                            value={
                              alreadySubmitted
                                ? parseFloat(quoted).toFixed(2)
                                : quotedPrices[uniqueId] || ""
                            }
                            onChange={(e) =>
                              handlePriceChange(e.target.value, detail.id, supplier.id)
                            }
                            className={`w-full border rounded-md px-4 py-2 text-sm shadow-sm focus:outline-none ${
                              alreadySubmitted
                                ? "bg-gray-100 border-gray-300 text-gray-500"
                                : "border-gray-300 focus:ring-2 focus:ring-indigo-500"
                            }`}
                          />
                          {alreadySubmitted && (
                            <span className="absolute top-1/2 right-3 -translate-y-1/2 text-xs font-medium text-green-600 pointer-events-none">
                              Already submitted
                            </span>
                          )}
                        </div>

                        <div className="md:col-span-3">
                          <button
                            type="submit"
                            disabled={alreadySubmitted || isSubmitting}
                            className={`w-full flex justify-center items-center gap-2 py-2 px-4 font-medium text-sm rounded-md transition ${
                              alreadySubmitted
                                ? "bg-gray-400 text-white cursor-not-allowed"
                                : isSubmitting
                                ? "bg-gray-400 text-white cursor-wait"
                                : "bg-green-600 hover:bg-green-700 text-white"
                            }`}
                          >
                            {alreadySubmitted ? (
                              <>
                                <CheckCircle2 className="w-4 h-4" />
                                Submitted
                              </>
                            ) : isSubmitting ? (
                              "Submitting..."
                            ) : (
                              <>
                                <CheckCircle2 className="w-4 h-4" />
                                Submit
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ApproverLayout>
  );
}
