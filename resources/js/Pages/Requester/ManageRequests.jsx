import TooltipLink from "@/Components/Tooltip";
import RequesterLayout from "@/Layouts/RequesterLayout";
import { Head, router } from "@inertiajs/react";
import { useState } from "react";

export default function ManageRequests({ purchaseRequests }) {
  const [approvalImages, setApprovalImages] = useState({});

  const handleFileChange = (e, id) => {
    const file = e.target.files[0];
    setApprovalImages((prev) => ({ ...prev, [id]: file }));
  };

  const handleSendForApproval = (id) => {
    if (!approvalImages[id]) {
      alert("Please select an approval image first.");
      return;
    }
    if (confirm("Are you sure you want to send this PR for approval?")) {
      const formData = new FormData();
      formData.append("approval_image", approvalImages[id]);

      router.post(route("requester.pr.send_for_approval", id), formData, {
        forceFormData: true,
        onSuccess: () => {
          alert("Sent for approval successfully!");
          setApprovalImages((prev) => {
            const copy = { ...prev };
            delete copy[id];
            return copy;
          });
        },
      });
    }
  };

  const handlePrint = (id) => {
    window.open(route("requester.print", id), "_blank");
  };

  return (
    <RequesterLayout header="Schools Division Office - Ilagan | Manage Requests">
      <Head title="Manage Requests" />

      <div className="max-w-7xl mx-auto mt-8 bg-white p-8 shadow-lg rounded-lg">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800 border-b border-gray-200 pb-3">
          Your Purchase Requests
        </h2>

        {(!purchaseRequests || purchaseRequests.length === 0) ? (
          <p className="text-center text-gray-500 text-lg py-10">No purchase requests found.</p>
        ) : (
          <div className="overflow-x-auto rounded-md border border-gray-200 shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {["PR Number", "Purpose", "Status", "Date Created", "Signed PR Form", "Actions"].map((header) => (
                    <th
                      key={header}
                      className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider select-none"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {purchaseRequests.map((pr) => (
                  <tr key={pr.id} className="hover:bg-blue-50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-blue-600 hover:underline cursor-pointer text-center">
                      <TooltipLink
                        to={route("requester.add_details", pr.id)}
                        tooltip="Add items for this PR"
                        className="focus:outline-none focus:ring-2 focus:ring-blue-400 rounded"
                      >
                        {pr.pr_number}
                      </TooltipLink>
                    </td>

                    <td className="px-6 py-4 text-gray-700 text-center">{pr.purpose}</td>

                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold
                          ${
                            pr.status === "Approved"
                              ? "bg-green-100 text-green-800"
                              : pr.status === "Pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : pr.status === "Rejected"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                          }
                        `}
                      >
                        {pr.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-gray-600 text-center font-mono text-sm">
                      {new Date(pr.created_at).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-4 text-center">
                      {pr.is_sent === 0 ? (
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, pr.id)}
                          className="border border-gray-300 rounded px-2 py-1 text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                      ) : (
                        <span className="text-green-600 font-semibold">Approval form already sent</span>
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap flex justify-center items-center space-x-3">
                      {pr.is_sent === 0 && (
                        <button
                          onClick={() => handleSendForApproval(pr.id)}
                          className="px-4 py-1 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                        >
                          Send for Approval
                        </button>
                      )}
                      <button
                        onClick={() => handlePrint(pr.id)}
                        className="px-4 py-1 bg-gray-600 text-white rounded-md shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
                      >
                        Print
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </RequesterLayout>
  );
}
