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
  Printer,
} from "lucide-react";

export default function RecordIar({ po }) {
    const { data, setData, post, processing, errors } = useForm({
        po_id: po.id,
        iar_number: po.po_number,
        specs: po.rfq.purchase_request.details[0]?.product?.specs || '',
        unit_id: po.rfq.purchase_request.details[0]?.product?.unit?.id || '',
        quantity_ordered: po.details[0]?.quantity || '',
        quantity_received: '',
        unit_price: po.details[0]?.unit_price || '',
        total_price: po.details[0]?.total_price || '',
        remarks: '',
        inspected_by: '',
        date_received: '',
    });

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route('supply_officer.store_iar'));
  };

  const inputClass =
    "w-full border p-2 rounded pl-10 focus:outline-none focus:ring-2 focus:ring-blue-400 transition";

  const iconClass = "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500";

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

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">

          {/* IAR Number */}
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

          {/* Date Received */}
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

          {/* Quantity Ordered */}
          <div className={inputGroupClass}>
            <Package size={18} className={iconClass} />
            <input
              type="number"
              className={inputClass}
              placeholder="Quantity Ordered"
              value={data.quantity_ordered}
              disabled
            />
          </div>

          {/* Quantity Received */}
          <div className={inputGroupClass}>
            <Boxes size={18} className={iconClass} />
            <input
              type="number"
              className={inputClass}
              placeholder="Quantity Received"
              value={data.quantity_received}
              onChange={(e) => setData("quantity_received", e.target.value)}
            />
          </div>

          {/* Unit Price (₱) */}
          <div className={inputGroupClass}>
            <span className={iconClass}>₱</span>
            <input
              type="number"
              className={inputClass}
              placeholder="Unit Price"
              value={data.unit_price}
              onChange={(e) => setData("unit_price", e.target.value)}
            />
          </div>

          {/* Total Price (₱) */}
          <div className={inputGroupClass}>
            <span className={iconClass}>₱</span>
            <input
              type="number"
              className={inputClass}
              placeholder="Total Price"
              value={data.total_price}
              onChange={(e) => setData("total_price", e.target.value)}
            />
          </div>

          {/* Specs */}
          <div className="col-span-2 relative">
            <FileText size={18} className="absolute left-3 top-3 text-gray-500" />
            <input
              className="w-full border p-2 pl-10"
              placeholder="Specs"
              value={data.specs}
              onChange={(e) => setData("specs", e.target.value)}
            />
          </div>

          {/* Remarks */}
          <div className="col-span-2 relative">
            <MessageSquareText size={18} className="absolute left-3 top-3 text-gray-500" />
            <textarea
              className="w-full border p-2 pl-10 rounded h-20 resize-none"
              placeholder="Remarks"
              value={data.remarks}
              onChange={(e) => setData("remarks", e.target.value)}
            />
          </div>

          {/* Inspected By */}
          <div className="col-span-2 relative">
            <UserCheck size={18} className={iconClass} />
            <input
              type="text"
              className={inputClass}
              placeholder="Inspected By"
              value={data.inspected_by}
              onChange={(e) => setData("inspected_by", e.target.value)}
            />
          </div>

          {/* Submit */}
          <div className="col-span-2 flex justify-end gap-2">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
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
