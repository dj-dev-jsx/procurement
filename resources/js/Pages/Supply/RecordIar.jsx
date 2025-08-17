import { useForm } from "@inertiajs/react";
import SupplyOfficerLayout from "@/Layouts/SupplyOfficerLayout";
import { Head } from "@inertiajs/react";
import {
  ClipboardSignature,
  CalendarCheck,
  Package,
  Boxes,
  FileText,
  MessageSquareText,
  UserCheck,
  Save,
} from "lucide-react";

export default function RecordIar({ po }) {
  const { data, setData, post, processing, errors } = useForm({
    po_id: po.id,
    iar_number: po.po_number,
    date_received: "",
    items: (po.details || []).map(detail => {
      // Find the matching PR detail from RFQ's purchase request
      const prDetail = po.rfq?.purchase_request?.details?.find(
        pr => pr.id === detail.pr_detail_id
      );

      return {
        pr_details_id: detail.pr_detail_id,
        supplier_name: po.supplier?.company_name || "Unknown Supplier",
        product_name: prDetail?.item || "", // Now correctly pulled from PR detail
        specs: prDetail?.specs || "",
        unit_id: prDetail?.product?.unit?.id || "",
        quantity_ordered: detail.quantity || "",
        quantity_received: "",
        unit_price: detail.unit_price || "",
        total_price: detail.total_price || "",
        remarks: "",
        inspected_by: "",
      };
    })
  });

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...data.items];
    updatedItems[index][field] = value;
    setData("items", updatedItems);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // console.log("Submitting data:", JSON.stringify(data, null, 2)); // Debug
    post(route("supply_officer.store_iar"));
  };


  const inputClass =
    "w-full border p-2 rounded pl-10 focus:outline-none focus:ring-2 focus:ring-blue-400 transition";
  const iconClass =
    "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500";
  const inputGroupClass = "relative";

  return (
    <SupplyOfficerLayout header="Schools Divisions Office - Ilagan | Record Inspection and Acceptance">
      <Head title="Record IAR" />
      <div className="bg-white p-6 shadow rounded-lg animate-fade-in">
        <h2 className="text-2xl font-bold mb-6 text-blue-800">
          📄 Record IAR for PO #{po.po_number}
        </h2>

        {Object.keys(errors).length > 0 && (
          <div className="col-span-2 bg-red-100 text-red-700 p-4 rounded mb-4">
            <ul className="list-disc list-inside">
              {Object.entries(errors).map(([key, message]) => (
                <li key={key}>{message}</li>
              ))}
            </ul>
          </div>
        )}

<form onSubmit={handleSubmit} className="space-y-8">
  {/* Global Fields */}
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
    <div className={inputGroupClass}>
      <ClipboardSignature size={18} className={iconClass} />
      <input
        type="text"
        className={inputClass}
        placeholder="IAR Number"
        value={data.iar_number}
        onChange={(e) => setData("iar_number", e.target.value)}
      />
    </div>
    <div className={inputGroupClass}>
      <CalendarCheck size={18} className={iconClass} />
      <input
        type="date"
        className={inputClass}
        placeholder="Date Received"
        value={data.date_received}
        onChange={(e) => setData("date_received", e.target.value)}
      />
    </div>
  </div>

  {/* Items */}
  <div className="space-y-6">
    {data.items.map((item, index) => (
      <div
        key={item.pr_detail_id}
        className="bg-gray-50 border border-gray-200 rounded-lg p-6 shadow-sm space-y-5"
      >
        {/* Header */}
        <div>
          <h3 className="text-lg font-semibold text-blue-700">
            {item.product_name}
          </h3>
          <p className="text-sm text-gray-500 italic">
            {item.supplier_name}
          </p>
        </div>

        {/* Specs */}
        <div className={inputGroupClass}>
          <FileText size={18} className={iconClass} />
          <input
            className={inputClass}
            placeholder="Specs"
            value={item.specs}
            onChange={(e) => handleItemChange(index, "specs", e.target.value)}
          />
        </div>

        {/* Quantities & Prices in Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className={inputGroupClass}>
            <Package size={18} className={iconClass} />
            <input
              type="number"
              className={inputClass}
              placeholder="Qty Ordered"
              value={item.quantity_ordered}
              readOnly // use readOnly instead of disabled so value is still posted
              onChange={(e) => handleItemChange(index, "quantity_ordered", e.target.value)}
            />
          </div>

          <div className={inputGroupClass}>
            <Boxes size={18} className={iconClass} />
            <input
              type="number"
              className={inputClass}
              placeholder="Qty Received"
              value={item.quantity_received}
              onChange={(e) =>
                handleItemChange(index, "quantity_received", e.target.value)
              }
            />
          </div>
          <div className={inputGroupClass}>
            <span className={iconClass}>₱</span>
            <input
              type="number"
              className={inputClass}
              placeholder="Unit Price"
              value={item.unit_price}
              onChange={(e) =>
                handleItemChange(index, "unit_price", e.target.value)
              }
            />
          </div>
          <div className={inputGroupClass}>
            <span className={iconClass}>₱</span>
            <input
              type="number"
              className={inputClass}
              placeholder="Total Price"
              value={item.total_price}
              onChange={(e) =>
                handleItemChange(index, "total_price", e.target.value)
              }
            />
          </div>
        </div>

        {/* Remarks & Inspected By */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className={inputGroupClass}>
            <MessageSquareText size={18} className={iconClass} />
            <textarea
              className="w-full border p-2 pl-10 rounded h-20 resize-none"
              placeholder="Remarks"
              value={item.remarks}
              onChange={(e) =>
                handleItemChange(index, "remarks", e.target.value)
              }
            />
          </div>
        </div>
      </div>
    ))}
  </div>

  {/* Submit */}
  <div className="flex justify-end">
    <button
      type="submit"
      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow"
      disabled={processing}
    >
      <Save size={16} />
      Save IAR
    </button>
  </div>
</form>

      </div>
    </SupplyOfficerLayout>
  );
}
