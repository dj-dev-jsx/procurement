import { useForm, Head } from "@inertiajs/react";
import SupplyOfficerLayout from "@/Layouts/SupplyOfficerLayout";
import {
  ClipboardSignature,
  CalendarCheck,
  Package,
  Boxes,
  MessageSquareText,
  UserCheck,
  Save,
  ScanLine,
} from "lucide-react";
import { useMemo } from "react";

// This reusable component is defined outside the main component to prevent focus-loss bugs.
const LabeledInput = ({ icon, label, children }) => (
  <div className="flex flex-col gap-1">
    <label className="text-sm font-semibold text-gray-600 flex items-center gap-2">
      {icon}
      {label}
    </label>
    {children}
  </div>
);

export default function RecordIar({ po }) {
  const { data, setData, post, processing, errors } = useForm({
    po_id: po.id,
    iar_number: po.po_number,
    date_received: "",
    inspected_by: "", // Moved to a global field for better UX
    items: (po.details || []).map(detail => {
      const prDetail = po.rfq?.purchase_request?.details?.find(
        pr => pr.id === detail.pr_detail_id
      );
      return {
        pr_details_id: detail.pr_detail_id,
        product_name: prDetail?.item || "Unknown Item",
        specs: prDetail?.specs || "No specs provided",
        quantity_ordered: parseFloat(detail.quantity || 0),
        unit_price: parseFloat(detail.unit_price || 0),
        // User-editable fields
        quantity_received: "",
        remarks: "",
        // This field is required for submission but is calculated automatically
        total_price: 0,
      };
    })
  });

  // This function now correctly updates the total_price in the state
  const handleItemChange = (index, field, value) => {
    setData('items', data.items.map((item, i) => {
      if (i === index) {
        const updatedItem = { ...item, [field]: value };
        const receivedQty = parseFloat(updatedItem.quantity_received || 0);
        updatedItem.total_price = receivedQty * updatedItem.unit_price;
        return updatedItem;
      }
      return item;
    }));
  };

  // Calculate the grand total for display
  const grandTotal = useMemo(() => {
    return data.items.reduce((total, item) => total + item.total_price, 0);
  }, [data.items]);

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route("supply_officer.store_iar"));
  };

  return (
    <SupplyOfficerLayout header="Schools Divisions Office - Ilagan | Record Inspection and Acceptance">
      <Head title="Record IAR" />
      <div className="bg-white p-8 shadow-lg rounded-xl animate-fade-in mx-auto">
        <div className="mb-6 border-b pb-4">
            <h2 className="text-3xl font-bold text-gray-800">
            Inspection & Acceptance Report
            </h2>
            <p className="text-gray-500">For Purchase Order #{po.po_number}</p>
        </div>


        {Object.keys(errors).length > 0 && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-6" role="alert">
            <h3 className="font-bold mb-2">Please correct the following errors:</h3>
            <ul className="list-disc list-inside">
              {Object.entries(errors).map(([key, message]) => (
                <li key={key}>{message}</li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* --- Section 1: Global Information --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border rounded-lg bg-gray-50">
            <LabeledInput icon={<ClipboardSignature size={16} />} label="IAR Number">
              <input
                type="text"
                className="w-full border-gray-300 p-2 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={data.iar_number}
                onChange={(e) => setData("iar_number", e.target.value)}
                required
              />
            </LabeledInput>
            <LabeledInput icon={<CalendarCheck size={16} />} label="Date Received">
              <input
                type="date"
                className="w-full border-gray-300 p-2 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={data.date_received}
                onChange={(e) => setData("date_received", e.target.value)}
                required
              />
            </LabeledInput>
          </div>

          {/* --- Section 2: Received Items --- */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-700">Received Items</h3>
            {data.items.map((item, index) => {
              const totalReceivedPrice = item.quantity_received * item.unit_price;
              const hasDiscrepancy = parseFloat(item.quantity_received || 0) !== item.quantity_ordered;

              return (
              <div
                key={item.pr_details_id}
                className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm transition-all hover:shadow-md"
              >
                {/* Item Header */}
                <div className="flex justify-between items-start mb-4 pb-4 border-b">
                    <div>
                        <h4 className="text-lg font-semibold text-blue-800">{item.product_name}</h4>
                        <p className="text-sm text-gray-500">{item.specs}</p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                        <p className="text-sm font-bold text-gray-700">Unit Price</p>
                        <p className="text-lg font-mono text-green-700">₱{item.unit_price.toFixed(2)}</p>
                    </div>
                </div>

                {/* Quantities & Totals Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Qty Ordered (Static Info) */}
                  <LabeledInput icon={<Package size={16} />} label="Quantity Ordered">
                    <p className="w-full bg-gray-200 text-gray-800 p-2 rounded-md text-center font-bold text-lg">{item.quantity_ordered}</p>
                  </LabeledInput>

                  {/* Qty Received (User Input) */}
                  <LabeledInput icon={<Boxes size={16} />} label="Quantity Received *">
                    <input
                      type="number"
                      className={`w-full border p-2 rounded-md text-center font-bold text-lg focus:outline-none focus:ring-2 ${hasDiscrepancy ? 'border-yellow-400 ring-yellow-300' : 'border-gray-300 focus:ring-blue-500'}`}
                      placeholder="0"
                      value={item.quantity_received}
                      onChange={(e) => handleItemChange(index, "quantity_received", e.target.value)}
                      required
                    />
                  </LabeledInput>

                  {/* Total for Item (Calculated) */}
                  <LabeledInput icon={<ScanLine size={16} />} label="Total for Item">
                     <p className="w-full bg-blue-100 text-blue-800 p-2 rounded-md text-center font-bold text-lg">
                        ₱{totalReceivedPrice.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                     </p>
                  </LabeledInput>
                </div>
                
                {/* Remarks */}
                <div className="mt-6">
                    <LabeledInput icon={<MessageSquareText size={16} />} label="Remarks">
                        <textarea
                            className="w-full border-gray-300 p-2 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 resize-none"
                            placeholder="Add remarks for this item (e.g., damaged box, wrong color)"
                            value={item.remarks}
                            onChange={(e) => handleItemChange(index, "remarks", e.target.value)}
                            rows={2}
                        />
                    </LabeledInput>
                </div>
              </div>
            )})}
          </div>

          {/* --- Section 3: Footer & Submission --- */}
          <div className="border-t pt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <LabeledInput icon={<UserCheck size={16} />} label="Inspected By *">
                    <input
                        type="text"
                        className="w-full border-gray-300 p-2 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Full Name of Inspector"
                        value={data.inspected_by}
                        onChange={(e) => setData("inspected_by", e.target.value)}
                        required
                    />
                </LabeledInput>
                
                <div className="text-right">
                    <p className="text-md font-semibold text-gray-600">Grand Total Received</p>
                    <p className="text-3xl font-bold text-gray-800">
                        ₱{grandTotal.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </p>
                </div>
            </div>

            <div className="flex justify-end mt-4">
              <button
                type="submit"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-lg transition-transform transform hover:scale-105 disabled:opacity-50"
                disabled={processing}
              >
                <Save size={18} />
                {processing ? "Saving..." : "Save Inspection Report"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </SupplyOfficerLayout>
  );
}