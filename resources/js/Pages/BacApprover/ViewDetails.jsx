import ApproverLayout from "@/Layouts/ApproverLayout";
import { Head } from "@inertiajs/react";

export default function ViewDetails({ pr }) {
    return (
        <ApproverLayout header="Schools Divisions Office - Ilagan | View Details">
            <Head title={`PR #${pr.pr_number} Details`} />

            <div className="max-w-5xl mx-auto mt-10 p-6 bg-white shadow-xl rounded-2xl">
                <div className="border-b pb-4 mb-6">
                    <h2 className="text-3xl font-bold text-gray-800">
                        Purchase Request <span className="text-primary">#{pr.pr_number}</span>
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Created on {new Date(pr.created_at).toLocaleString()}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700 text-base">
                    <div><span className="font-medium">Purpose:</span> {pr.purpose}</div>
                    <div><span className="font-medium">Status:</span> <span className={`inline-block px-2 py-1 rounded text-white ${pr.status === 'Approved' ? 'bg-green-500' : 'bg-yellow-500'}`}>{pr.status}</span></div>
                    <div><span className="font-medium">Requested By:</span> {pr.requester_name}</div>
                    <div><span className="font-medium">Division:</span> {pr.division}</div>
                </div>

                {pr.approval_image && (
                    <div className="mt-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Approval Image</h3>
                        <img
                            src={`/storage/${pr.approval_image}`}
                            alt="Approval Form"
                            className="w-full max-h-[400px] object-contain border rounded-lg shadow"
                        />
                    </div>
                )}

                <div className="mt-8">
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">Item Details</h3>
                    <div className="overflow-x-auto rounded-lg border">
                        <table className="min-w-full text-sm text-left text-gray-700">
                            <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
                                <tr>
                                    <th className="px-4 py-3 border">Item</th>
                                    <th className="px-4 py-3 border">Specs</th>
                                    <th className="px-4 py-3 border">Unit</th>
                                    <th className="px-4 py-3 border text-center">Qty</th>
                                    <th className="px-4 py-3 border text-right">Unit Price</th>
                                    <th className="px-4 py-3 border text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pr.details.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-2 border">{item.item}</td>
                                        <td className="px-4 py-2 border">{item.specs}</td>
                                        <td className="px-4 py-2 border">{item.unit}</td>
                                        <td className="px-4 py-2 border text-center">{item.quantity}</td>
                                        <td className="px-4 py-2 border text-right">₱{Number(item.unit_price).toFixed(2)}</td>
                                        <td className="px-4 py-2 border text-right font-semibold text-gray-800">
                                            ₱{Number(item.total_price).toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </ApproverLayout>
    );
}
