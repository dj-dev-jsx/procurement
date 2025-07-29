import IssuanceTabs from '@/Layouts/IssuanceTabs';
import SupplyOfficerLayout from '@/Layouts/SupplyOfficerLayout';
import { TrashIcon } from '@heroicons/react/16/solid';
import { Head } from '@inertiajs/react';
import { PenBoxIcon, PrinterCheckIcon } from 'lucide-react';
import { useState } from 'react';


export default function Par({purchaseOrders, inventoryItems, par, user}) {
    console.log("PO:", purchaseOrders);
    console.log("IV:",inventoryItems);
    console.log("PAR:",par);

    const [search, setSearch] = useState('');
    const [filterMonth, setFilterMonth] = useState('');
    const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  
  
    const getInventory = (specs, unitId) => inventoryItems.find(
      inv =>
        inv.item_desc === specs && inv.inventory?.unit === unitId
    )?.inventory;
  
    const getIcsRecords = (poId, inventoryID) => par.find(
      i => i.po_id === poId && i.inventory_item_id === inventoryID
    );
  return (
    <SupplyOfficerLayout header="Schools Divisions Office - Ilagan | Requisition and Issue Slip">
      <Head title='PAR'/>
      <IssuanceTabs />

      {/* Your RIS content here */}
        {/* RIS table or form here */}
         <div className="bg-white rounded-lg p-6 shadow space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <h2 className="text-lg font-bold mb-4">Inventory Custodian Slip (ICS)</h2>
          {/* RIS table or form here */}
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

        <div className="overflow-x-auto mt-4">
          <table className="min-w-full divide-y divide-gray-200 text-sm text-left text-gray-700">
            <thead className="bg-gray-100 text-xs font-semibold uppercase tracking-wider text-gray-600">
              <tr>
                <th className="px-4 py-2">#</th>
                <th className="px-4 py-2">PAR No.</th>
                <th className="px-4 py-2">Division</th>
                <th className="px-4 py-2">Received By/Focal Person</th>
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
                  const parData = getIcsRecords(po.id, inventoryData?.id);
                  if (!parData) return null;
                  const dateReceived = parData?.created_at
                    ? new Date(parData.created_at).toLocaleDateString('en-PH', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : '—';

                  return(
                    <tr key={`${po.id} - ${index}`}>
                      <td className="px-4 py-2">{index+1}</td>
                      <td className="px-4 py-2">{parData?.par_number}</td>
                      <td className="px-4 py-2">{division}</td>
                      <td className="px-4 py-2">{focal}</td>
                      <td className="px-4 py-2">{item}</td>
                      <td className="px-4 py-2">{parData?.quantity}</td>
                      <td className="px-4 py-2">₱{Number(inventoryData?.unit_cost ?? 0).toFixed(2)}</td>
                      <td className="px-4 py-2">₱{(Number(inventoryData?.unit_cost ?? 0) * detail.quantity).toFixed(2)}</td>
                      <td className="px-4 py-2">{dateReceived}</td>
                        <td className=" flex px-4 py-2 text-center space-x-2">
                          <button className="flex justify-center items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                            <PenBoxIcon className='h-4 w-4' />
                            Edit
                          </button>
                          <button className="flex justify-center items-center gap-2 px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition">
                            <PrinterCheckIcon className='h4 w-4'/>
                            Print
                          </button>
                          <button className="flex justify-center items-center gap-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition">
                            <TrashIcon className='h-4 w-4'/>
                            Delete
                          </button>
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
