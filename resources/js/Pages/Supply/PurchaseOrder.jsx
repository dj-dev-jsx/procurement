import SupplyOfficerLayout from "@/Layouts/SupplyOfficerLayout";
import { Head, useForm } from "@inertiajs/react";
import React, { useEffect } from "react";

export default function PurchaseOrder({ purchaseRequests, filters }) {
  const { data, setData, get } = useForm({
    search: filters.search || "",
    division: filters.division || "",
  });

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      get(route("supply_officer.purchase_orders"), {
        preserveState: true,
        replace: true,
      });
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [data.search, data.division]);

  return (
    <SupplyOfficerLayout header="Schools Division Office - Ilagan | Create Purchase Order">
      <Head title="Purchase Order" />

      {/* Header and Search */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
        <h2 className="text-3xl font-bold text-gray-800">
          Purchase Requests with Selected Suppliers
        </h2>

        <form onSubmit={(e) => e.preventDefault()} className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            name="search"
            placeholder="Search PR number or focal person"
            className="w-96 border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={data.search}
            onChange={(e) => setData("search", e.target.value)}
          />
          <select
            value={data.division}
            onChange={(e) => setData("division", e.target.value)}
            className="border border-gray-300 px-10 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Divisions</option>
            {filters.divisions.map((division) => (
              <option key={division.id} value={division.id}>
                {division.division}
              </option>
            ))}
          </select>
        </form>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm bg-white">
        <table className="w-full table-auto text-sm divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {[
                "PR Number",
                "Focal Person",
                "Division",
                "Item",
                "Specs",
                "Quantity",
                "Unit",
                "Winner Supplier",
                "Quoted Price",
                "Actions",
              ].map((title) => (
                <th
                  key={title}
                  className="px-6 py-3 text-xs font-bold text-gray-600 uppercase tracking-wide text-center whitespace-nowrap"
                >
                  {title}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 text-center">
            {purchaseRequests.data.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12 text-gray-500 text-lg font-medium">
                  No Purchase Requests with winners found.
                </td>
              </tr>
            ) : (
              purchaseRequests.data.map((pr) => {
                const prHasWinner = pr.details.some((detail) =>
                  pr.rfqs?.flatMap((r) => r.details).some(
                    (d) => d.pr_details_id === detail.id && d.is_winner
                  )
                );

                return prHasWinner ? (
                  <React.Fragment key={`pr-${pr.id}`}>
                    {pr.details.map((detail, index) => {
                      const winner = pr.rfqs
                        ?.flatMap((r) => r.details ?? [])
                        .find((d) => d.pr_details_id === detail.id && d.is_winner);

                      if (!winner) return null;

                      return (
                        <tr key={`pr-${pr.id}-detail-${detail.id}`} className="hover:bg-blue-50 transition duration-200">
                          <td className="px-6 py-4 font-semibold text-blue-700 whitespace-nowrap">
                            {pr.pr_number}
                          </td>
                          <td className="px-6 py-4">
                            {pr.focal_person.firstname} {pr.focal_person.lastname}
                          </td>
                          <td className="px-6 py-4">{pr.division.division}</td>
                          <td className="px-6 py-4">{detail.product.name}</td>
                          <td className="px-6 py-4">{detail.product.specs}</td>
                          <td className="px-6 py-4">{detail.quantity}</td>
                          <td className="px-6 py-4">{detail.product.unit.unit}</td>
                          <td className="px-6 py-4">{winner.supplier?.company_name || "N/A"}</td>
                          <td className="px-6 py-4">₱ {parseFloat(winner.quoted_price).toFixed(2)}</td>
                          {index === 0 && (
                            <td className="px-6 py-4 align-middle">
                              <a
                                href={route("supply_officer.create_po", pr.id)}
                                className="inline-block px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition"
                              >
                                Purchase Order
                              </a>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </React.Fragment>
                ) : null;
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex justify-center flex-wrap gap-1">
        {purchaseRequests.links.map((link, i) => (
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
