import ApproverLayout from "@/Layouts/ApproverLayout";
import { Head, router, usePage } from "@inertiajs/react";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";

export default function ViewDetails({ pr }) {
    
    console.log(pr);
    const sendBack = (id) => {
        Swal.fire({
            title: "Send Back Reason",
            input: "textarea",
            inputPlaceholder: "Enter your reason for sending back...",
            inputAttributes: {
                "aria-label": "Enter your reason for sending back"
            },
            showCancelButton: true,
            confirmButtonColor: "#EF4444", // Red for destructive/cautionary action
            cancelButtonColor: "#6B7280", // Gray for cancel
            confirmButtonText: "Send Back",
            preConfirm: (reason) => {
                if (!reason) {
                    Swal.showValidationMessage("You must provide a reason.");
                }
                return reason;
            }
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(route("requester.send_back", id), { reason: result.value }, {
                    preserveScroll: true,
                    preserveState: true,
                    onSuccess: () => {
                        Swal.fire({
                            icon: "success",
                            title: "Sent Back!",
                            text: "The PR has been sent back with your reason.",
                            confirmButtonColor: "#22C55E", // Green for success
                        });
                    },
                    onError: () => {
                        Swal.fire({
                            icon: "error",
                            title: "Error",
                            text: "Failed to send back PR. Please try again.",
                            confirmButtonColor: "#EF4444", // Red for error
                        });
                    },
                });
            }
        });
    };


    return (
        <ApproverLayout header="Schools Divisions Office - Ilagan | View Details">
            <Head title={`PR #${pr.pr_number} Details`} />

            <div className="mx-auto mt-10 p-6 bg-white shadow-xl rounded-xl">
                {/* Back Button */}
                <div className="mb-6">
                    <button
                        onClick={() => window.history.back()}
                        className="inline-flex items-center px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-sm font-medium transition-colors duration-200 ease-in-out shadow-sm
                                   focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back
                    </button>
                </div>

                <div className="border-b pb-4 mb-6">
                    <h2 className="text-3xl font-bold text-gray-800">
                        Purchase Request <span className="text-indigo-600">#{pr.pr_number}</span> {/* Using a more vibrant primary color */}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Created on {new Date(pr.created_at).toLocaleString()}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700 text-base">
                    <div><span className="font-semibold text-gray-800">Purpose:</span> {pr.purpose}</div>
                    <div>
                        <span className="font-semibold text-gray-800">Status:</span>
                        <span className={`ml-2 inline-block px-3 py-1 rounded-full text-xs font-semibold
                                        ${pr.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                          pr.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                          'bg-gray-100 text-gray-800'}`}> {/* More refined status badges */}
                            {pr.status}
                        </span>
                    </div>
                    <div><span className="font-semibold text-gray-800">Requested By:</span> {pr.requester_name}</div>
                    <div><span className="font-semibold text-gray-800">Division:</span> {pr.division}</div>
                </div>

                {pr.approval_image && (
                    <div className="mt-8">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Approval Image</h3>
                        <img
                            src={`/storage/${pr.approval_image}`}
                            alt="Approval Form"
                            className="w-full max-h-[400px] object-contain border border-gray-200 rounded-lg shadow-md"
                        />
                    </div>
                )}

                <div className="mt-8">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Item Details</h3>
                    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                        <table className="min-w-full text-sm text-left text-gray-700">
                            <thead className="bg-gray-50 text-gray-600 uppercase text-xs border-b border-gray-200">
                                <tr>
                                    <th className="px-4 py-3 border-r border-gray-200">Item</th>
                                    <th className="px-4 py-3 border-r border-gray-200">Specs</th>
                                    <th className="px-4 py-3 border-r border-gray-200">Unit</th>
                                    <th className="px-4 py-3 border-r border-gray-200 text-center">Qty</th>
                                    <th className="px-4 py-3 border-r border-gray-200 text-right">Unit Price</th>
                                    <th className="px-4 py-3 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pr.details.map((item, index) => (
                                    <tr key={item.id} className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                        <td className="px-4 py-2 border-r border-gray-200">{item.item}</td>
                                        <td className="px-4 py-2 border-r border-gray-200">{item.specs}</td>
                                        <td className="px-4 py-2 border-r border-gray-200">{item.unit}</td>
                                        <td className="px-4 py-2 border-r border-gray-200 text-center">{item.quantity}</td>
                                        <td className="px-4 py-2 border-r border-gray-200 text-right">₱{Number(item.unit_price).toFixed(2)}</td>
                                        <td className="px-4 py-2 text-right font-semibold text-gray-800">
                                            ₱{Number(item.total_price).toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Action Buttons - Placed at the bottom for clear call to action */}
                <div className="mt-8 flex justify-end space-x-4">
                    {pr.status.toLowerCase() !== "approved" && (
                        <button
                        onClick={async () => {
                            const result = await Swal.fire({
                            title: "Are you sure?",
                            text: "You are about to approve this request.",
                            icon: "warning",
                            showCancelButton: true,
                            confirmButtonColor: "#4f46e5",
                            cancelButtonColor: "#d33",
                            confirmButtonText: "Confirm!",
                            });

                            if (result.isConfirmed) {
                            router.visit(route("bac_approver.approve", pr.id));
                            }
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm shadow"
                        >
                        Approve
                        </button>
                    )}
                    {pr.status.toLowerCase() !== "approved" && (
                        <button
                            onClick={() => sendBack(pr.id)}
                            className="inline-flex items-center px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg text-base font-semibold transition-colors duration-200 ease-in-out shadow-md
                                    focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                            </svg>
                            Send Back
                        </button>
                    )}
                </div>
            </div>
        </ApproverLayout>
    );
}