import TooltipLink from "@/Components/Tooltip";
import ApproverLayout from "@/Layouts/ApproverLayout";
import { Head } from "@inertiajs/react";
import { useState } from "react";
import { XMarkIcon, EyeIcon, CheckCircleIcon } from "@heroicons/react/24/solid";

export default function ForReview({ sentPurchaseRequests, flash }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [showModal, setShowModal] = useState(false);

  return (
    <ApproverLayout header="Schools Divisions Office - Ilagan | For Review" flash={flash}>
      <Head title="PRs For Review" />

      <div className="max-w-6xl mx-auto mt-8 bg-white p-8 shadow-lg rounded-lg">
        <h2 className="text-3xl font-semibold mb-6 text-gray-800 border-b border-gray-200 pb-3">
          Purchase Requests For Review
        </h2>

        {sentPurchaseRequests.length === 0 ? (
          <p className="text-center text-gray-500 py-12 text-lg font-medium">
            No purchase requests ready for review.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-md border border-gray-200 shadow-sm">
            <table className="min-w-full table-auto divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {["PR Number", "Purpose", "Status", "Date Sent", "Action"].map((title) => (
                    <th
                      key={title}
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider select-none"
                    >
                      {title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {sentPurchaseRequests.map((pr) => (
                  <tr
                    key={pr.id}
                    className="hover:bg-blue-50 transition-colors duration-200"
                  >
                    <td className="px-6 py-4 font-semibold text-blue-700 whitespace-nowrap">
                      <TooltipLink
                        to={route("bac_approver.show_details", pr.id)}
                        tooltip="View PR details"
                        className="hover:underline focus:underline focus:outline-none"
                      >
                        {pr.pr_number}
                      </TooltipLink>
                    </td>

                    <td className="px-6 py-4 text-gray-700">{pr.purpose}</td>
                    <td className="px-6 py-4">
                        {pr.status.toLowerCase() === "approved" && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                            Approved
                            </span>
                        )}
                        {pr.status.toLowerCase() === "pending" && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-800">
                            Pending
                            </span>
                        )}
                        {pr.status.toLowerCase() === "rejected" && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800">
                            Rejected
                            </span>
                        )}
                        {/* fallback if status is something else */}
                        {!["approved", "pending", "rejected"].includes(pr.status.toLowerCase()) && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-800 capitalize">
                            {pr.status}
                            </span>
                        )}
                        </td>

                    <td className="px-6 py-4 text-gray-600 whitespace-nowrap font-mono text-sm">
                      {new Date(pr.created_at).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap flex space-x-3">
                      <button
                        onClick={() => {
                          setSelectedImage(`/storage/${pr.approval_image}`);
                          setShowModal(true);
                        }}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 transition"
                        aria-label="View Approved Form"
                      >
                        <EyeIcon className="w-5 h-5 mr-2" />
                        View Form
                      </button>

                      <a
                        href={route("bac_approver.approve", pr.id)}
                        onClick={(e) => {
                          if (!confirm("Are you sure you want to approve this?")) {
                            e.preventDefault();
                          }
                        }}
                        className="inline-flex items-center px-5 py-2 bg-green-600 text-white text-sm font-semibold rounded-md shadow-sm hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-1 transition"
                        aria-label="Approve Purchase Request"
                      >
                        <CheckCircleIcon className="w-5 h-5 mr-2" />
                        Approve
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal */}
        {showModal && selectedImage && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            onClick={() => setShowModal(false)} // Close modal on background click
          >
            <div
              className="relative bg-white rounded-lg shadow-xl max-w-xl w-full max-h-[90vh] overflow-auto"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
              tabIndex={-1}
            >
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 rounded"
                aria-label="Close modal"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>

              <h3
                id="modal-title"
                className="text-xl font-semibold text-gray-800 p-4 border-b"
              >
                Approved Form
              </h3>

              <img
                src={selectedImage}
                alt="Approved Form"
                className="w-full h-auto object-contain rounded-b-lg p-4"
              />
            </div>
          </div>
        )}
      </div>
    </ApproverLayout>
  );
}
