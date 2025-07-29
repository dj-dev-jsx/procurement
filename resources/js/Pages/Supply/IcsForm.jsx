import SupplyOfficerLayout from "@/Layouts/SupplyOfficerLayout";
import { Head, useForm } from "@inertiajs/react";
import { FileText, SendHorizonal } from "lucide-react";

export default function IcsForm({ purchaseOrder, inventoryItem, user }) {
  const detail = purchaseOrder.details?.[0];
  const pr = detail?.pr_detail?.purchase_request;
  const product = detail?.pr_detail?.product;
  const focal = pr
  ? `${pr.focal_person.firstname} ${pr.focal_person.middlename} ${pr.focal_person.lastname}`
  : "N/A";
  const {data, setData, post, processing, errors} = useForm({
      po_id: detail.po_id,
      ics_number: purchaseOrder.po_number,
      inventory_item_id: inventoryItem.id,
      received_by: pr.focal_person.id,
      received_from: user.id,
      quantity: detail?.quantity,
      unit_cost: detail?.unit_price,
      total_cost: detail?.total_price,
      remarks: ''
  });

  const item = product
  ? `${product.name} (${product.specs})`
  : "N/A";

  const isInStock = true; // Replace with actual inventory logic
  const handleSubmit = (e) => {
      e.preventDefault();
      post(route('supply_officer.store_ics'));
  };

  return (
    <SupplyOfficerLayout header="Schools Divisions Office - Ilagan | Inventory Custodian Slip">
      <Head title="ICS Form" />
      <button
        type="button"
        onClick={() => window.history.back()}
        className="inline-flex items-center px-4 py-2 bg-white text-blue-800 border border-blue-300 text-sm font-semibold rounded-md hover:bg-blue-100 hover:border-blue-400 mr-4 mb-4 shadow-sm transition"
      >
        ← Back
      </button>
      <div className="bg-blue-50 p-8 rounded-xl shadow-md">
        <h2 className="text-3xl font-bold text-blue-800 mb-1 flex items-center gap-2">
          <FileText size={24} /> Inventory Custodian Slip (ICS)
        </h2>
        <p className="text-sm text-gray-700 mb-6">
          <strong>Note:</strong> This item is categorized as <em>Semi-Expendable (Below 50k)</em> and will be issued using an ICS form.
        </p>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Section */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Designation</label>
              <input
                value={pr?.division?.division ?? "N/A"}
                readOnly
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">ICS No.</label>
              <input
                type="text"
                placeholder="ICS Number"
                value={data.ics_number}
                onChange={(e) => setData("ics_number", e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white"
              />
            </div>

            {/* <div>
              <label className="block text-sm font-medium text-gray-700">Purpose</label>
              <textarea
                value={pr?.purpose ?? "N/A"}
                rows="3"
                readOnly
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white"
              />
            </div> */}

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <input
                value={item}
                readOnly
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Quantity</label>
                <input
                  type="number"
                  placeholder="Quantity"
                  value={data.quantity}
                  onChange={(e) => setData("quantity", e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Unit</label>
                <input
                  value={product?.unit?.unit ?? "N/A"}
                  readOnly
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white"
                />
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Unit Cost</label>
                <input
                  type="number"
                  placeholder="Unit Cost"
                  value={data.unit_cost}
                  onChange={(e) => setData("unit_cost", e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Total Cost</label>
                <input
                  type="number"
                  placeholder="Total Cost"
                  value={data.total_cost}
                  onChange={(e) => setData("total_cost", e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Requested By</label>
              <input
                type="text"
                value={focal}
                readOnly
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Recipient</label>
              <input
                type="text"
                value={focal}
                readOnly
                placeholder="Enter recipient name"
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Remarks</label>
              <textarea
                type="text"
                value={data.remarks}
                onChange={(e) => setData("remarks", e.target.value)}
                rows="4"
                placeholder="Enter remarks (optional)"
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white"
              ></textarea>
            </div>
          </div>
          <div className="col-span-full flex justify-end mt-4">
            <button
              type="submit"
              className="inline-flex items-center px-6 py-2 bg-blue-700 text-white text-sm font-medium rounded-md hover:bg-blue-800 transition"
            >
              <SendHorizonal size={16} className="mr-2" />
              Submit Issuance
            </button>
          </div>
        </form>

        
      </div>
    </SupplyOfficerLayout>
  );
}
