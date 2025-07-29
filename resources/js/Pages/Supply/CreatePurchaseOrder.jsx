import { Head, useForm } from "@inertiajs/react";
import { useEffect, useState } from "react";
import SupplyOfficerLayout from "@/Layouts/SupplyOfficerLayout";

export default function CreatePurchaseOrder({ pr, rfq, suppliers, winners, supplier, supplierQuotedPrices }) {
  const [selectedSupplierId, setSelectedSupplierId] = useState(supplier?.id ?? "");

  const initialItems = winners.map((item) => {
    const unit_price = supplierQuotedPrices[selectedSupplierId]?.[item.pr_detail_id] ?? 0;
    const total_price = item.quantity * unit_price;
    return { ...item, unit_price, total_price };
  });

  const { data, setData, post, processing, errors } = useForm({
    rfq_id: rfq.id,
    supplier_id: selectedSupplierId,
    items: initialItems,
  });

  // Update unit prices and totals when supplier changes
  useEffect(() => {
    const updatedItems = winners.map((item) => {
      const unit_price = supplierQuotedPrices[selectedSupplierId]?.[item.pr_detail_id] ?? 0;
      const total_price = item.quantity * unit_price;
      return { ...item, unit_price, total_price };
    });

    setData("supplier_id", selectedSupplierId);
    setData("items", updatedItems);
  }, [selectedSupplierId]);

  const handleChange = (index, field, value) => {
    const updatedItems = [...data.items];
    updatedItems[index][field] = field === "quantity" || field === "unit_price" ? Number(value) : value;

    updatedItems[index].total_price =
      Number(updatedItems[index].quantity) * Number(updatedItems[index].unit_price);

    setData("items", updatedItems);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route("supply_officer.store_po"));
  };

  return (
    <SupplyOfficerLayout header={"Schools Divisions Office - Ilagan | Create Purchase Order"}>
      <Head title="Create Purchase Order" />

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow mx-auto max-w-6xl">
        <h2 className="text-2xl font-bold mb-6">Create PO for PR #{pr.pr_number}</h2>

        {/* Supplier Selector */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-1">Supplier</label>
          <select
            value={selectedSupplierId}
            onChange={(e) => setSelectedSupplierId(parseInt(e.target.value))}
            className="w-auto border border-gray-300 rounded px-auto py-2"
          >
            <option value="">-- Select Supplier --</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.company_name}
              </option>
            ))}
          </select>
          {errors.supplier_id && <p className="text-red-500 text-sm mt-1">{errors.supplier_id}</p>}
        </div>

        {/* Item Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border border-gray-300 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-4 py-2 text-left">Item</th>
                <th className="border px-4 py-2 text-left">Specs</th>
                <th className="border px-4 py-2 text-center">Unit</th>
                <th className="border px-4 py-2 text-right">Quantity</th>
                <th className="border px-4 py-2 text-right">Unit Price</th>
                <th className="border px-4 py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="border px-4 py-2">{item.item}</td>
                  <td className="border px-4 py-2">{item.specs}</td>
                  <td className="border px-4 py-2 text-center">{item.unit}</td>
                  <td className="border px-4 py-2 text-right">
                    <input
                      type="number"
                      min="0"
                      value={item.quantity}
                      onChange={(e) => handleChange(index, "quantity", e.target.value)}
                      className="w-20 border rounded px-2 py-1 text-right"
                    />
                  </td>
                  <td className="border px-4 py-2 text-right">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unit_price}
                      onChange={(e) => handleChange(index, "unit_price", e.target.value)}
                      className="w-24 border rounded px-2 py-1 text-right"
                    />
                  </td>
                  <td className="border px-4 py-2 text-right">
                    ₱{Number(item.total_price).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={processing}
          className="mt-6 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-semibold"
        >
          {processing ? "Submitting..." : "Submit Purchase Order"}
        </button>
      </form>
    </SupplyOfficerLayout>
  );
}
