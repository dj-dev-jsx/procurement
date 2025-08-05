import { useEffect, useState } from "react";
import {
  FilePlus2,
  Users2,
  Truck,
  ScrollText,
  CheckCircle2,
} from "lucide-react";
import ApproverLayout from "@/Layouts/ApproverLayout";
import axios from 'axios';
import { Head, useForm } from "@inertiajs/react";
import Swal from 'sweetalert2';


export default function GenerateRFQ({ pr, suppliers, purchaseRequest, rfqs, flash }) {
  const [selectedSupplierId, setSelectedSupplierId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showEstimatedPrice, setShowEstimatedPrice] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [submittedSuppliers, setSubmittedSuppliers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [printMode, setPrintMode] = useState("combined");

  const [estimatedPrice, setEstimatedPrice] = useState(
    pr.details?.[0]?.unit_price || ""
  );

  const openModalForItem = (itemId) => {
    setSelectedItemId(itemId);
    setData((prev) => ({ ...prev, pr_detail_id: itemId }));
    setShowModal(true);

    const selectedItem = pr.details.find((detail) => detail.id === itemId);
    if (selectedItem) {
      const unitPrice = selectedItem.unit_price || "";
      setEstimatedPrice(unitPrice);
      setData((prev) => ({ ...prev, estimated_bid: unitPrice }));
    }
  };
  const userId = purchaseRequest?.focal_person?.id;
  const { data, setData, post, processing, errors, reset } = useForm({
      pr_id: pr.id,
      user_id: purchaseRequest?.focal_person?.id ?? null,
      supplier_id: '',
      estimated_bid: pr.details?.[0]?.unit_price || "", 
      selections: []
  });
  const addSelection = (itemId, supplierId, estimatedBid) => {
    setData("selections", [
      ...data.selections,
      {
        pr_detail_id: itemId,
        supplier_id: supplierId,
        estimated_bid: estimatedBid,
      },
    ]);
  };


  const handleChange = (e) => {
    const selectedId = e.target.value;
    setSelectedSupplierId(selectedId);
    setData('supplier_id', selectedId);

    if (!estimatedPrice.trim()) {
      const defaultUnitPrice = pr.details?.[0]?.unit_price || '';
      setEstimatedPrice(defaultUnitPrice);
      setData('estimated_bid', defaultUnitPrice);
    }

    setShowEstimatedPrice(false); 
  };
  const filteredSuppliers = suppliers.filter((supplier) =>
    supplier.representative_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentSuppliers = filteredSuppliers.slice(indexOfFirst, indexOfLast);

  const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage);



  const handleEstimatedPriceChange = (e) => {
    const value = e.target.value;
    setEstimatedPrice(value);
    setData('estimated_bid', value);
  };
 const [submittedEntries, setSubmittedEntries] = useState([]);

function isSupplierAlreadySubmitted(itemId, supplierId) {
  return submittedEntries.some(
    (entry) => entry.itemId === itemId && entry.supplierId === supplierId
  );
}

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!selectedSupplierId) {
    Swal.fire({
      icon: 'warning',
      title: 'No Supplier Selected',
      text: 'Please select a supplier before proceeding.',
    });
    return;
  }

  if (!showEstimatedPrice) {
    setShowEstimatedPrice(true);
    return;
  }

  if (!estimatedPrice.trim()) {
    Swal.fire({
      icon: 'warning',
      title: 'Missing Estimated Price',
      text: 'Please enter an estimated price.',
    });
    return;
  }

  const result = await Swal.fire({
    icon: 'question',
    title: 'Are you sure?',
    text: 'Do you want to submit this RFQ?',
    showCancelButton: true,
    confirmButtonText: 'Confirm',
    cancelButtonText: 'Cancel',
  });

  if (!result.isConfirmed) return;

  if (isSupplierAlreadySubmitted(selectedItemId, selectedSupplierId)) {
    Swal.fire({ 
      icon: 'warning',
      title: 'Duplicate Supplier',
      text: 'This supplier has already been submitted for this item.',
    });
    return;
  }

  setSubmitting(true);

post(route('bac_approver.store_rfq'), {
  pr_id: pr.id,
  user_id: userId,
  selections: [
    {
      pr_detail_id: selectedItemId,
      supplier_id: selectedSupplierId,
      estimated_bid: estimatedPrice,
    }
  ],
  preserveScroll: true,
  onSuccess: () => {
    Swal.fire({
      icon: 'success',
      title: 'Success!',
      text: 'The Request for Quotation has been submitted successfully.',
    });

    setSubmittedEntries(prev => [
      ...prev,
      {
        itemId: selectedItemId,
        supplierId: selectedSupplierId,
      },
    ]);

    reset(); 
    setSelectedSupplierId(""); 
    setShowEstimatedPrice(false); 
  },
  onError: (errors) => {
    if (errors.supplier_id) {
      Swal.fire({
        icon: 'error',
        title: 'Duplicate Entry',
        text: errors.supplier_id,
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Submission Failed',
        text: 'Please check your input fields.',
      });
    }
  },
  onFinish: () => setSubmitting(false),
});


};


const handlePrintRFQ = (rfqId) => {
  if (printMode === "combined") {
    window.open(route("bac_approver.print_rfq", rfqId), "_blank");
  } else {
    const rfq = rfqs.find((r) => r.id === rfqId);
    rfq?.details.forEach((detail) => {
      window.open(
        route("bac_approver.print_rfq_per_item", {
          rfq: rfqId,
          detail: detail.pr_details_id,
        }),
        "_blank"
      );
    });
  }
};




  return (
    <ApproverLayout
      header={"Schools Divisions Office - Ilagan | Request for Quotation"}
    >
      <Head title="Request for Quotation" />
      <div className="mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <ScrollText className="w-7 h-7 text-indigo-700" />
            Generate Request for Quotation (RFQ)
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
          {/* Left: Purchase Request Details */}
          <div className="xl:col-span-1 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
              <FilePlus2 className="w-5 h-5 text-indigo-600" />
              Purchase Request Info
            </h2>
            <div className="space-y-3 text-sm text-gray-700">
              <p><strong>PR Number:</strong> {pr.pr_number}</p>
              <p><strong>Purpose:</strong> {pr.purpose || "N/A"}</p>
              <p><strong>Requested By:</strong> {pr.requester_name || "N/A"}</p>
              <p><strong>Division:</strong> {pr.division || "N/A"}</p>
              <p><strong>Date Created:</strong> {new Date(pr.created_at).toLocaleDateString()}</p>
              <p><strong>Focal Person:</strong>{" "}
                {purchaseRequest.focal_person
                  ? `${purchaseRequest.focal_person.firstname} ${purchaseRequest.focal_person.middlename || ""} ${purchaseRequest.focal_person.lastname || ""}`
                  : "N/A"}
              </p>
              {pr.approval_image && (
                <div className="mt-4">
                  <p className="font-medium text-sm mb-1">Approval Image:</p>
                  <img
                    src={`/storage/${pr.approval_image}`}
                    alt="Approval"
                    className="rounded-md shadow max-h-96 border"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Right: RFQ Form and Supplier Table */}
          <div className="xl:col-span-2 space-y-8">
            {/* RFQ Form */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
                <Truck className="w-5 h-5 text-indigo-600" />
                Generate RFQ
              </h2>
              <div className="mb-4">
                <label className="block mb-2 font-medium text-gray-700">
                  Select Item from PR
                </label>
                <div className="overflow-x-auto border rounded-md shadow-sm">
                  <table className="min-w-full text-sm text-gray-700">
                    <thead className="bg-gray-50 text-gray-600 uppercase text-xs tracking-wide">
                      <tr>
                        <th className="py-3 px-4 text-left border-b">Item</th>
                        <th className="py-3 px-4 text-left border-b">Specifications</th>
                        <th className="py-3 px-4 text-left border-b">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pr.details.map((detail) => (
                        <tr key={detail.id} className="hover:bg-indigo-50 transition-colors">
                          <td className="py-3 px-4 border-b">{detail.item}</td>
                          <td className="py-3 px-4 border-b">{detail.specs}</td>
                          <td className="py-3 px-4 border-b">
                            <button
                              onClick={() => openModalForItem(detail.id)}
                              className="text-sm bg-indigo-600 text-white hover:bg-indigo-700 px-3 py-1 rounded-md"
                            >
                              Choose Supplier
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>



              {selectedSupplierId && (
                <div className="mb-4 text-sm text-gray-700 bg-indigo-50 border border-indigo-300 rounded p-3">
                  <strong>Selected Supplier:</strong>{" "}
                  {
                    suppliers.find((s) => s.id === parseInt(selectedSupplierId))?.representative_name ||
                    "Unknown"
                  }{" "}
                  —{" "}
                  {
                    suppliers.find((s) => s.id === parseInt(selectedSupplierId))?.company_name ||
                    ""
                  }
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
                {showEstimatedPrice && (
                  <div>
                    <label htmlFor="estimatedPrice" className="block mb-2 font-medium">
                      Estimated Price (₱)
                    </label>
                    <input
                      id="estimatedPrice"
                      type="number"
                      min="0"
                      value={estimatedPrice}
                      onChange={handleEstimatedPriceChange}
                      required
                      className="w-full border rounded-md px-4 py-2 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className={`w-full flex items-center justify-center gap-2 py-3 text-white font-semibold rounded-md transition duration-150 ease-in-out ${
                    submitting
                      ? "bg-blue-950 cursor-not-allowed"
                      : "bg-blue-950 hover:bg-blue-900"
                  }`}
                >
                  <CheckCircle2 className="w-5 h-5" />
                  {submitting
                    ? "Submitting..."
                    : showEstimatedPrice
                    ? "Next"
                    : "Proceed"}
                </button>
              </form>
            </div>

              {/* Supplier Modal */}
              {showModal && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="bg-white rounded-lg shadow-lg max-w-5xl w-full p-6 relative">
                    <button
                      onClick={() => setShowModal(false)}
                      className="absolute top-2 right-3 text-gray-500 hover:text-gray-700 text-xl font-bold"
                    >
                      ×
                    </button>

                    <h2 className="text-lg font-semibold mb-4">Select a Supplier</h2>

                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm text-gray-700">
                        <thead className="bg-gray-50 text-gray-600 uppercase text-xs tracking-wide">
                          <tr>
                            <th className="py-3 px-4 text-left border-b">ID</th>
                            <th className="py-3 px-4 text-left border-b">Name</th>
                            <th className="py-3 px-4 text-left border-b">Company Name</th>
                            <th className="py-3 px-4 text-left border-b">Item</th>
                            <th className="py-3 px-4 text-left border-b">Address</th>
                            <th className="py-3 px-4 text-left border-b">TIN</th>
                            <th className="py-3 px-4 text-left border-b">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentSuppliers.length > 0 ? (
                            currentSuppliers.map((supplier) => (
                              <tr key={supplier.id} className="hover:bg-indigo-50 transition-colors">
                                <td className="py-3 px-4 border-b">{supplier.id}</td>
                                <td className="py-3 px-4 border-b">{supplier.representative_name}</td>
                                <td className="py-3 px-4 border-b">{supplier.company_name}</td>
                                <td className="py-3 px-4 border-b">{supplier.item}</td>
                                <td className="py-3 px-4 border-b">{supplier.address}</td>
                                <td className="py-3 px-4 border-b">{supplier.tin_num}</td>
                                <td className="py-3 px-4 border-b">
                                  <button
                                    onClick={() => {
                                      // Fallback unit price from the item if not entered yet
                                      const finalBid = estimatedPrice.trim() || (pr.details?.find(d => d.id === selectedItemId)?.unit_price || "");

                                      addSelection(selectedItemId, supplier.id, finalBid); // <-- Call the addSelection function

                                      setSelectedSupplierId(supplier.id);
                                      setEstimatedPrice(finalBid); // Update UI state
                                      setShowEstimatedPrice(true);
                                      setShowModal(false);
                                    }}

                                    className="text-sm bg-indigo-600 text-white hover:bg-indigo-700 px-3 py-1 rounded-md"
                                  >
                                    Select
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="7" className="text-center py-6 text-gray-400 italic">
                                No suppliers available.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-between items-center mt-4">
                      <button
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50"
                      >
                        ← Prev
                      </button>
                      <span className="text-sm text-gray-700">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50"
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                </div>
              )}

            {/* Quotation Info Table */}
            <div className="mb-4 max-w-sm flex items-center gap-3">
              <label className="font-medium text-sm text-gray-700">Print Mode:</label>
              <select
                value={printMode}
                onChange={(e) => setPrintMode(e.target.value)}
                className="border rounded px-3 py-2 shadow-sm focus:ring-2 focus:outline-none"
              >
                <option value="combined">All Items in One Document</option>
                <option value="separate">One Document per Item</option>
              </select>
            </div>

            {/* Quotation Info Table */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
                <ScrollText className="w-5 h-5 text-indigo-600" />
                Submitted RFQs / Quotations
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-gray-700">
                  <thead className="bg-gray-50 text-gray-600 uppercase text-xs tracking-wide">
                    <tr>
                      <th className="py-3 px-4 text-left border-b">Supplier</th>
                      <th className="py-3 px-4 text-left border-b">Item</th>
                      <th className="py-3 px-4 text-left border-b">Estimated Bid (₱) per Unit</th>
                      <th className="py-3 px-4 text-left border-b">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rfqs.length > 0 ? (
                      rfqs.flatMap((rfq) =>
                        rfq.details.map((detail, index) => (
                          <tr key={`${rfq.id}-${index}`} className="hover:bg-indigo-50 transition-colors">
                            <td className="py-3 px-4 border-b">{detail.supplier?.representative_name}</td>
                            <td className="py-3 px-4 border-b">{detail.pr_detail?.product?.name}</td>
                            <td className="py-3 px-4 border-b">
                              {detail.estimated_bid
                                ? `₱${Number(detail.estimated_bid).toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                  })}`
                                : "₱0.00"}
                            </td>
                            <td className="py-3 px-4 border-b flex gap-2">
                              <button
                                onClick={() => {
                                  if (printMode === "combined") {
                                    handlePrintRFQ(rfq.id);
                                  } else {
                                    // print only this detail
                                    window.open(
                                      route("bac_approver.print_rfq_per_item", {
                                        rfq: rfq.id,
                                        detail: detail.pr_details_id,
                                      }),
                                      "_blank"
                                    );
                                  }
                                }}
                                className="text-sm text-white bg-green-600 hover:bg-green-700 px-3 py-1 rounded-md"
                              >
                                🖨️ Print
                              </button>
                              {printMode === "separate" && (
                                <span className="text-xs italic text-gray-500 self-center">
                                  (per item)
                                </span>
                              )}
                            </td>
                          </tr>
                        ))
                      )
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center py-6 text-gray-400 italic">
                          No quotations submitted yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      </div>
    </ApproverLayout>
  );
}
