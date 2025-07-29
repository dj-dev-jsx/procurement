import IssuanceTabs from '@/Layouts/IssuanceTabs';
import SupplyOfficerLayout from '@/Layouts/SupplyOfficerLayout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';

export default function Ris({purchaseOrders, inventoryItems, ris, user}) {
  console.log("PO:", purchaseOrders);
  console.log("IV:",inventoryItems);
  console.log("RIS:",ris);


  const [search, setSearch] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());


  const getInventory = (specs, unitId) => inventoryItems.find(
    inv =>
      inv.item_desc === specs && inv.inventory?.unit === unitId
  )?.inventory;

  const getRisRecords = (poId, inventoryID) => ris.find(
    r => r.po_id === poId && r.inventory_item_id === inventoryID
  );
  return (
    <SupplyOfficerLayout header="Schools Divisions Office - Ilagan | Requisition and Issue Slip">
      <Head title='RIS' />
      <IssuanceTabs />

      <div className="bg-white rounded-lg p-6 shadow space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <h2 className="text-lg font-bold mb-4">Requisition and Issue Slip (RIS)</h2>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm shadow">
              Monthly Report
            </button>
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm shadow">
              Export PDF
            </button>
            <button className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md text-sm shadow">
              Export Excel
            </button>
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm shadow">
              + New RIS
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Month:</label>
            <select
              className="border border-gray-300 rounded-md px-2 py-1 text-sm"
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
            >
              <option value="">All</option>
              {[
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'
              ].map((month, idx) => (
                <option key={idx} value={idx + 1}>{month}</option>
              ))}
            </select>

            <label className="text-sm font-medium ml-4">Year:</label>
            <input
              type="number"
              className="border border-gray-300 rounded-md px-2 py-1 w-20 text-sm"
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
            />
          </div>

          <div>
            <input
              type="text"
              placeholder="Search RIS number, item..."
              className="border border-gray-300 rounded-md px-3 py-2 w-full md:w-64 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* RIS Table */}
        <div className="overflow-x-auto mt-4">
          <table className="min-w-full divide-y divide-gray-200 text-sm text-left text-gray-700">
            <thead className="bg-gray-100 text-xs font-semibold uppercase tracking-wider text-gray-600">
              <tr>
                <th className="px-4 py-2">#</th>
                <th className="px-4 py-2">RIS No.</th>
                <th className="px-4 py-2">Division</th>
                <th className="px-4 py-2">Issued To/Focal Person</th>
                <th className="px-4 py-2">Item Description</th>
                <th className="px-4 py-2">Quantity</th>
                <th className="px-4 py-2">Unit Cost</th>
                <th className="px-4 py-2">Total Cost</th>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {purchaseOrders.map((po) =>
                po.details?.map((detail, index) => {
                  const product = detail.pr_detail?.product ?? "N/A";
                  const specs = product?.specs ?? "N/A";
                  const unit = product?.unit?.id ?? "N/A";
                  const item = `${product?.name} ${specs}` ?? "N/A";
                  const focal = `${detail.pr_detail?.purchase_request?.focal_person.firstname} ${detail.pr_detail?.purchase_request?.focal_person.middlename} ${detail.pr_detail?.purchase_request?.focal_person.lastname}` ?? "N/A";
                  const division = detail.pr_detail?.purchase_request?.division.division ?? "N/A";
                  const inventoryData = getInventory(specs, unit);
                  const risData = getRisRecords(po.id, inventoryData?.id);
                  if (!risData) return null;
                  const dateReceived = risData?.created_at
                    ? new Date(risData.created_at).toLocaleDateString('en-PH', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : '—';

                  return(
                    <tr key={`${po.id} - ${index}`}>
                      <td className="px-4 py-2">{index+1}</td>
                      <td className="px-4 py-2">{risData?.ris_number}</td>
                      <td className="px-4 py-2">{division}</td>
                      <td className="px-4 py-2">{focal}</td>
                      <td className="px-4 py-2">{item}</td>
                      <td className="px-4 py-2">{risData?.quantity}</td>
                      <td className="px-4 py-2">₱{Number(inventoryData?.unit_cost ?? 0).toFixed(2)}</td>
                      <td className="px-4 py-2">₱{(Number(inventoryData?.unit_cost ?? 0) * detail.quantity).toFixed(2)}</td>
                      <td className="px-4 py-2">{dateReceived}</td>
                      <td className="px-4 py-2 text-center space-x-2">
                        <button className="text-blue-600 hover:underline">Edit</button>
                        <button className="text-green-600 hover:underline">Copy</button>
                        <button className="text-red-600 hover:underline">Delete</button>
                      </td>
                    </tr>
                  );
                })
              )}
              
            </tbody>
          </table>
        </div>
      </div>
    </SupplyOfficerLayout>
  );
}
