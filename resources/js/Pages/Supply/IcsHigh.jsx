import IssuanceTabs from '@/Layouts/IssuanceTabs';
import SupplyOfficerLayout from '@/Layouts/SupplyOfficerLayout';
import { TrashIcon } from "@heroicons/react/16/solid";
import { Head, useForm } from '@inertiajs/react';
import { PenBoxIcon, PrinterCheckIcon } from 'lucide-react';
import { useEffect } from 'react'; // Only need useEffect

// A small helper function to safely get nested data. This is crucial to prevent crashes.
const getSafe = (fn, defaultValue = "N/A") => {
  try {
    const value = fn();
    return value === null || value === undefined ? defaultValue : value;
  } catch (e) {
    return defaultValue;
  }
};

// The component now accepts a simple `icsRecords` prop, plus filters and user.
export default function IcsHigh({ icsRecords, user, filters }) {

  const { data, setData, get } = useForm({
    search: filters?.search ?? "",
    month: filters?.month ?? "",
    year: filters?.year ?? new Date().getFullYear(),
  });



useEffect(() => {
  const timeoutId = setTimeout(() => {
    get(route("supply_officer.ics_issuance_high"), {
      preserveState: true,
      replace: true,
      data,   // pass whole form state
    });
  }, 500); // debounce 500ms

  return () => clearTimeout(timeoutId);
}, [data.search, data.month, data.year]);



  return (
    <SupplyOfficerLayout header="Schools Divisions Office - Ilagan | Inventory Custodian Slip (ICS) - HIGH">
      <Head title='ICS - HIGH' />
      <IssuanceTabs />

      <div className="bg-white rounded-lg p-6 shadow-md space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <h2 className="text-xl font-bold text-gray-800">Inventory Custodian Slip (ICS) - HIGH VALUE</h2>
          <div className="flex flex-wrap items-center gap-2">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm shadow">
              Monthly Report
            </button>
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm shadow">
              Export PDF
            </button>
          </div>
        </div>
        
        {/* Filter Controls now use `data` and `setData` from the single useForm hook */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <label htmlFor="month-filter" className="text-sm font-medium">Month:</label>
            <select
              id="month-filter"
              className="border border-gray-300 rounded-md px-2 py-1 text-sm shadow-sm"
              value={data.month} // Use data.month
              onChange={(e) => setData('month', e.target.value)} // Use setData
            >
              <option value="">All</option>
              {[
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'
              ].map((month, idx) => (
                <option key={idx} value={idx + 1}>{month}</option>
              ))}
            </select>

            <label htmlFor="year-filter" className="text-sm font-medium ml-4">Year:</label>
            <input
              id="year-filter"
              type="number"
              className="border border-gray-300 rounded-md px-2 py-1 w-24 text-sm shadow-sm"
              value={data.year} // Use data.year
              onChange={(e) => setData('year', e.target.value)} // Use setData
            />
          </div>

          <div>
            <input
              type="text"
              placeholder="Search ICS number, item..."
              className="border border-gray-300 rounded-md px-3 py-2 w-full md:w-64 text-sm shadow-sm"
              value={data.search}
              onChange={(e) => setData('search', e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="min-w-full divide-y divide-gray-200 text-sm text-left text-gray-700">
            <thead className="bg-gray-100 text-xs font-semibold uppercase tracking-wider text-gray-600">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">ICS No.</th>
                <th className="px-4 py-3">Division</th>
                <th className="px-4 py-3">Received By</th>
                <th className="px-4 py-3">Item Description</th>
                <th className="px-4 py-3 text-center">Quantity</th>
                <th className="px-4 py-3 text-right">Unit Cost</th>
                <th className="px-4 py-3 text-right">Total Cost</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {icsRecords.length > 0 ? (
                // The map now uses the `icsRecords` prop directly.
                icsRecords.map((ics, index) => {
                  const division = getSafe(() => ics.po.rfq.purchase_request.division.division);
                  const receivedBy = getSafe(() => `${ics.received_by.firstname} ${ics.received_by.lastname}`);
                  const itemDesc = getSafe(() => ics.inventory_item.item_desc);
                  const unitCost = parseFloat(ics.unit_cost || 0);
                  const totalCost = parseFloat(ics.total_cost || 0);
                  const dateReceived = new Date(ics.created_at).toLocaleDateString('en-PH', {
                      year: 'numeric', month: 'long', day: 'numeric',
                  });

                  return (
                    <tr key={ics.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2">{index + 1}</td>
                      <td className="px-4 py-2 font-semibold text-gray-900">{ics.ics_number}</td>
                      <td className="px-4 py-2">{division}</td>
                      <td className="px-4 py-2">{receivedBy}</td>
                      <td className="px-4 py-2">{itemDesc}</td>
                      <td className="px-4 py-2 text-center font-medium">{ics.quantity}</td>
                      <td className="px-4 py-2 text-right">₱{unitCost.toFixed(2)}</td>
                      <td className="px-4 py-2 text-right font-semibold">₱{totalCost.toFixed(2)}</td>
                      <td className="px-4 py-2">{dateReceived}</td>
                      <td className="flex justify-center items-center px-4 py-2 space-x-2">
                          <button className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                              <PenBoxIcon className='h-4 w-4' /> Edit
                          </button>
                          <button className="flex items-center gap-2 px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition">
                              <PrinterCheckIcon className='h-4 w-4'/> Print
                          </button>
                          <button className="flex items-center gap-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition">
                              <TrashIcon className='h-4 w-4'/> Delete
                          </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="10" className="text-center py-8 text-gray-500">
                    No high-value ICS records found for the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </SupplyOfficerLayout>
  );
}