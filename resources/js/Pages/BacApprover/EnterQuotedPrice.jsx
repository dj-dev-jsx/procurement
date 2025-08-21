import { useState } from "react";
import {
  ScrollText,
  FilePlus2,
  CheckCircle2,
} from "lucide-react";
import ApproverLayout from "@/Layouts/ApproverLayout";
import { Head, useForm } from "@inertiajs/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@headlessui/react"; // Assuming this is your preferred button, or use "@/components/ui/button"

export default function EnterQuotedPrices({ pr, suppliers, rfqs, purchaseRequest, rfq_details }) {
  const [submittingId, setSubmittingId] = useState(null);
  const [quotedPrices, setQuotedPrices] = useState({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState({
    title: "",
    message: "",
    type: "success", // can be "success", "error", or "confirm"
  });
  // This state will hold the function to execute when the user confirms an action
  const [onConfirmAction, setOnConfirmAction] = useState(null);

  /**
   * Triggers the feedback/confirmation dialog.
   * @param {object} params - The dialog parameters.
   * @param {string} params.title - The title of the dialog.
   * @param {string} params.message - The main message of the dialog.
   * @param {string} params.type - The type of dialog ('success', 'error', 'confirm').
   * @param {Function} [params.onConfirm] - The function to call on confirmation.
   */
  const showDialog = ({ title, message, type, onConfirm = null }) => {
    setDialogContent({ title, message, type });
    setOnConfirmAction(() => onConfirm); // Use a more descriptive name for the state setter
    setDialogOpen(true);
  };

  const confirmSubmit = (e, detailId, supplierId) => {
    e.preventDefault();
    showDialog({
      title: "Confirm Submission",
      message: "Are you sure you want to submit this quoted price?",
      type: "confirm",
      onConfirm: () => handleSubmit(detailId, supplierId),
    });
  };

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

  const bulkForm = useForm({
    quotes: [],
  });

  const handlePriceChange = (value, detailId, supplierId) => {
    const key = `${detailId}-${supplierId}`;
    setQuotedPrices((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = (detailId, supplierId) => {
    const key = `${detailId}-${supplierId}`;
    const quoted_price = quotedPrices[key] === "" ? null : quotedPrices[key];

    const rfqDetail = rfq_details.find(
      (detail) => detail.pr_details_id == detailId && detail.supplier_id == supplierId
    );

    if (!rfqDetail || !rfqDetail.rfq_id) {
      showDialog({
        title: "Error",
        message: "No valid RFQ detail found for this supplier and item.",
        type: "error",
      });
      return;
    }

    form.data.rfq_id = rfqDetail.rfq_id;
    form.data.pr_details_id = detailId;
    form.data.supplier_id = supplierId;
    form.data.quoted_price = quoted_price;

    setSubmittingId(key);

    form.post(route("bac_approver.submit_quoted"), {
      preserveScroll: true,
      onSuccess: () => {
        setQuotedPrices((prev) => ({ ...prev, [key]: "" }));
        setSubmittingId(null);
        // This is the feedback dialog on success
        showDialog({
          title: "Submitted!",
          message: "Quoted price submitted successfully.",
          type: "success",
        });
      },
      onError: (errors) => {
        setSubmittingId(null);
        // This is the feedback dialog on error
        showDialog({
          title: "Oops!",
          message: errors?.quoted_price || "Something went wrong while submitting.",
          type: "error",
        });
      },
    });
  };

  const confirmSubmitAll = () => {
    showDialog({
      title: "Confirm Bulk Submission",
      message: "Are you sure you want to submit all quoted prices?",
      type: "confirm",
      onConfirm: () => handleSubmitAll(),
    });
  };

  const handleSubmitAll = () => {
    const entries = Object.entries(quotedPrices)
      .filter(([_, value]) => value !== "")
      .map(([key, value]) => {
        const [detailId, supplierId] = key.split("-");
        const rfqDetail = rfq_details.find(
          (rfq) =>
            rfq.pr_details_id == detailId &&
            rfq.supplier_id == supplierId
        );
        if (!rfqDetail) return null;
        return {
          rfq_id: rfqDetail.rfq_id,
          pr_details_id: detailId,
          supplier_id: supplierId,
          quoted_price: value,
        };
      })
      .filter((entry) => entry !== null);

    if (entries.length === 0) {
      showDialog({
        title: "No Prices to Submit",
        message: "Please enter at least one quoted price before submitting all.",
        type: "error",
      });
      return;
    }

    setSubmittingId("all");
    bulkForm.data.quotes = entries;

    bulkForm.post(route("bac_approver.submit_bulk_quoted"), {
      preserveScroll: true,
      onSuccess: () => {
        setQuotedPrices((prev) => {
          const updated = { ...prev };
          entries.forEach((entry) => {
            delete updated[`${entry.pr_details_id}-${entry.supplier_id}`];
          });
          return updated;
        });
        setSubmittingId(null);
        // This is the feedback dialog on bulk success
        showDialog({
          title: "All Quoted Prices Submitted!",
          message: "All prices have been submitted successfully.",
          type: "success",
        });
      },
      onError: (errors) => {
        console.error("❌ Errors:", errors);
        setSubmittingId(null);
        // This is the feedback dialog on bulk error
        showDialog({
          title: "Submission Failed",
          message: "Please check your inputs and try again.",
          type: "error",
        });
      }
    });
  };

  return (
    <ApproverLayout>
      <Head title="Enter Quoted Prices" />
      <div className="mx-auto px-6 py-10">
        {/* ... your existing JSX for the page layout ... */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <ScrollText className="w-8 h-8 text-indigo-700" />
            Enter Quoted Prices for PR: {pr.pr_number}
          </h1>
        </div>
        <div className="mb-4">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-md text-sm shadow-sm"
          >
            ← Back
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
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
          <div className="xl:col-span-2 space-y-10">
            {pr.details.map((detail) => (
              <div key={detail.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow">
                {/* ... Item details ... */}
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
                {rfq_details
                  .filter((rfq) => rfq.pr_details_id === detail.id)
                  .map((rfq) => {
                    const supplier = suppliers.find((s) => s.id === rfq.supplier_id);
                    if (!supplier) return null;
                    const uniqueId = `${detail.id}-${supplier.id}`;
                    const isSubmitting = submittingId === uniqueId;
                    const quoted = getQuotedPrice(detail.id, supplier.id);
                    const alreadySubmitted = quoted !== null;
                    return (
                      <form
                        key={uniqueId}
                        onSubmit={(e) => confirmSubmit(e, detail.id, supplier.id)}
                        className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center"
                      >
                       {/* ... form inputs ... */}
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
                              <><CheckCircle2 className="w-4 h-4" /> Submitted</>
                            ) : isSubmitting ? (
                              "Submitting..."
                            ) : (
                              <><CheckCircle2 className="w-4 h-4" /> Submit</>
                            )}
                          </button>
                        </div>
                      </form>
                    );
                  })}
                </div>
                {rfq_details.filter((rfq) => rfq.pr_details_id === detail.id).length >= 2 && (
                  <div className="text-right mt-6">
                    <button
                      onClick={confirmSubmitAll}
                      disabled={submittingId === "all"}
                      className={`inline-flex items-center gap-2 px-6 py-2 text-white text-sm font-semibold rounded-md shadow-sm transition ${
                        submittingId === "all"
                          ? "bg-gray-400 cursor-wait"
                          : "bg-indigo-600 hover:bg-indigo-700"
                      }`}
                    >
                      {submittingId === "all" ? "Submitting All..." : "Submit All Quotes"}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* This is your beautifully implemented feedback dialog! */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className={
              dialogContent.type === "error" ? "text-red-600" : 
              dialogContent.type === 'success' ? 'text-green-600' : ''
            }>
              {dialogContent.title}
            </DialogTitle>
            <DialogDescription>
              {dialogContent.message}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            {dialogContent.type === "confirm" ? (
              <>
                <Button
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md"
                  onClick={() => {
                    setDialogOpen(false);
                    setOnConfirmAction(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="px-4 py-2 bg-green-600 text-white rounded-md"
                  onClick={() => {
                    if (typeof onConfirmAction === 'function') {
                      onConfirmAction();
                    }
                    setDialogOpen(false);
                    setOnConfirmAction(null);
                  }}
                >
                  Confirm
                </Button>
              </>
            ) : (
              <Button
                className="px-4 py-2 bg-blue-600 text-white rounded-md"
                onClick={() => setDialogOpen(false)}
              >
                Close
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ApproverLayout>
  );
}