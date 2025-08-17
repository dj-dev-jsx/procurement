import SupplyOfficerLayout from "@/Layouts/SupplyOfficerLayout";
import { Head, useForm } from "@inertiajs/react";
import { PrinterCheck } from "lucide-react";
import React, { useEffect } from "react";

export default function TableIar({ iarData, filters }) {
  const { data, setData, get } = useForm({
    search: filters.search || "",
  });
console.log(iarData);
  useEffect(() => {
    const delay = setTimeout(() => {
      get(route("supply_officer.iar_table"), {
        preserveState: true,
        replace: true,
      });
    }, 300);

    return () => clearTimeout(delay);
  }, [data.search]);

  return (
    <SupplyOfficerLayout header="Schools Divisions Office - Ilagan | Inspection and Acceptance Reports">
      <Head title="Inspection and Acceptance Reports" />

      {/* Header and Filters */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
        <h2 className="text-3xl font-bold text-gray-800">
          Inspection and Acceptance Reports
        </h2>

        <form onSubmit={(e) => e.preventDefault()} className="flex gap-3">
          <input
            type="text"
            name="search"
            placeholder="Search IAR number or supplier"
            className="w-80 border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={data.search}
            onChange={(e) => setData("search", e.target.value)}
          />
        </form>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm bg-white">
        <table className="w-full table-auto text-sm divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {[
                "IAR Number",
                "Division",
                "Items",
                "Suppliers",
                "Total Price",
                "Inspected By",
                "Actions",
              ].map((title) => (
                <th
                  key={title}
                  className="px-6 py-3 text-xs font-bold text-gray-600 uppercase tracking-wide text-center"
                >
                  {title}
                </th>
              ))}
            </tr>
          </thead>
<tbody className="divide-y divide-gray-100 text-center">
  {(() => {
    if (!iarData?.data?.length) {
      return (
        <tr>
          <td colSpan="7" className="py-12 text-gray-500 text-lg font-medium">
            No Inspection Reports found.
          </td>
        </tr>
      );
    }

    // Group by IAR number
    const grouped = iarData.data.reduce((acc, iar) => {
      const key = iar.iar_number;
      if (!acc[key]) {
        acc[key] = {
          header: iar,
          specs: [],
          supplier: iar.purchase_order?.supplier?.company_name ?? "N/A",
          division: iar.purchase_order?.rfq?.purchase_request?.division?.division ?? "N/A",
          totalPrice: 0,
        };
      }
    

      // collect product specs from related PR details
      if (iar.purchase_order?.details?.length) {
        iar.purchase_order.details.forEach((d) => {
          if (d.pr_detail?.product?.specs) {
            acc[key].specs.push(d.pr_detail.product.specs);
          }
        });
      }

      // add IAR-level price (since qty_received & unit_price are on IAR record itself)
      const qtyReceived = parseFloat(iar.quantity_received) || 0;
      const unitPrice = parseFloat(iar.unit_price) || 0;
      acc[key].totalPrice += qtyReceived * unitPrice;

      return acc;
    }, {});
    console.log(grouped);

    // Render each IAR row
    return Object.values(grouped).map(({ header, specs, supplier, division, totalPrice }) => {
      const itemsSummary =
        specs.length > 1
          ? `${specs[0]} +${specs.length - 1} more`
          : specs[0] || "N/A";

      return (
        <tr key={header.iar_number} className="hover:bg-blue-50 transition duration-200">
          <td className="px-6 py-4 font-semibold text-blue-700 whitespace-nowrap">
            {header.iar_number}
          </td>
          <td className="px-6 py-4">{division}</td>
          <td className="px-6 py-4">{itemsSummary}</td>
          <td className="px-6 py-4">{supplier}</td>
          <td className="px-6 py-4">₱ {totalPrice.toFixed(2)}</td>
          <td className="px-6 py-4">{header.inspected_by}</td>
          <td className="px-6 py-4">
            <a
              href={route("supply_officer.print_iar", header.id)}
              className="bg-gray-600 text-white px-3 py-2 rounded hover:bg-gray-700 transition flex items-center justify-center gap-1"
              target="_blank"
            >
              <PrinterCheck size={16} /> Print
            </a>
          </td>
        </tr>
      );
    });
  })()}
</tbody>



        </table>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex justify-center flex-wrap gap-1">
        {iarData.links.map((link, i) => (
          <button
            key={i}
            disabled={!link.url}
            onClick={() => link.url && get(link.url)}
            className={`px-3 py-1 text-sm border rounded-md ${
              link.active
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
            dangerouslySetInnerHTML={{ __html: link.label }}
          />
        ))}
      </div>
    </SupplyOfficerLayout>
  );
}
