import TooltipLink from "@/Components/Tooltip";
import RequesterLayout from "@/Layouts/RequesterLayout";
import { Head, router, usePage } from "@inertiajs/react";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";

export default function ManageRequests({ purchaseRequests, search: initialSearch, month: initialMonth }) {
const { flash } = usePage().props;

  const [search, setSearch] = useState(initialSearch || "");
  const [month, setMonth] = useState(initialMonth || "");
  const [approvalImages, setApprovalImages] = useState({});

  const handleFileChange = (e, id) => {
    const file = e.target.files[0];
    setApprovalImages((prev) => ({ ...prev, [id]: file }));
  };

  const handleSendForApproval = (id) => {
    Swal.fire({
      title: "Send for Approval?",
      text: "You won't be able to edit this PR after sending.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#4f46e5",
      cancelButtonColor: "#d33",
      confirmButtonText: "Confirm",
    }).then((result) => {
      if (result.isConfirmed) {
        const formData = new FormData();
        if (approvalImages[id]) {
          formData.append("approval_image", approvalImages[id]);
        }

        router.post(route("requester.pr.send_for_approval", id), formData, {
          forceFormData: true,
          preserveScroll: true,
          preserveState: true,
          onSuccess: () => {
            Swal.fire({
              icon: "success",
              title: "Sent!",
              text: "The approved PR form has been sent.",
              confirmButtonColor: "#4f46e5",
            });
            setApprovalImages((prev) => {
              const copy = { ...prev };
              delete copy[id];
              return copy;
            });
          },
          onError: () => {
            Swal.fire({
              icon: "error",
              title: "Error",
              text: "Failed approved PR form. Please try again.",
              confirmButtonColor: "#d33",
            });
          },
        });
      }
    });
  };

  const handlePrint = (id) => {
    window.open(route("requester.print", id), "_blank");
  };

  useEffect(() => {
    if (flash?.success) {
      Swal.fire({
        icon: "success",
        title: "Success",
        text: flash.success,
        confirmButtonColor: "#4f46e5",
      });
    }
    if (flash?.error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: flash.error,
        confirmButtonColor: "#d33",
      });
    }
  }, [flash]);

  useEffect(() => {
    const delay = setTimeout(() => {
      router.get(route("requester.manage_requests"), { search, month }, {
        preserveScroll: true,
        preserveState: true,
        replace: true,
      });
    }, 300);

    return () => clearTimeout(delay);
  }, [search, month]);


  return (
    <RequesterLayout header="Schools Division Office - Ilagan | Manage Requests">
      <Head title="Manage Requests" />

      <div className="bg-white rounded-lg shadow p-6 mb-6 border border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Your Purchase Requests</h2>
          <button
            onClick={() => router.get(route("requester.create"))}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2 rounded-md shadow"
          >
            + Create PR
          </button>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-3 mb-5">
          <p className="text-gray-600 text-sm">
            Showing {purchaseRequests.from ?? 0} - {purchaseRequests.to ?? 0} of {purchaseRequests.total ?? 0} requests
          </p>

          <div className="flex gap-2 w-full md:w-auto">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search PR # or purpose..."
              className="px-4 py-2 border border-gray-300 rounded-md text-sm w-full md:w-64"
            />
            <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="px-10 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">All Months</option>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(0, i).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>


          </div>
        </div>

        <div className="overflow-x-auto rounded-md border border-gray-200 shadow-sm bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                {["PR Number", "Purpose", "Status", "Date Created", "Signed PR Form", "Actions"].map((header) => (
                  <th
                    key={header}
                    className="px-6 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {purchaseRequests.data.map((pr) => (
                <tr key={pr.id} className="hover:bg-indigo-50 transition duration-200">
                  <td className="px-6 py-4 text-center text-indigo-600 font-medium">
                    {(pr.is_sent === 0 && pr.status !== "Approved") ? (
                      <TooltipLink
                        to={route("requester.add_details", pr.id)}
                        tooltip="Add items for this PR"
                        className="hover:underline text-indigo-600"
                      >
                        {pr.pr_number}
                      </TooltipLink>
                    ) : (
                      <span className="text-gray-500 cursor-not-allowed">{pr.pr_number}</span>
                    )}

                  </td>
                  <td className="px-6 py-4 text-center text-gray-700">{pr.purpose}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      pr.status === "Approved" ? "bg-green-100 text-green-800" :
                      pr.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
                      pr.status === "Rejected" ? "bg-red-100 text-red-800" :
                      "bg-gray-200 text-gray-800"
                    }`}>
                      {pr.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-gray-600 text-sm font-mono">
                    {new Date(pr.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {pr.is_sent === 0 ? (
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, pr.id)}
                        className="text-sm px-2 py-1 border border-gray-300 rounded-md"
                      />
                    ) : (
                      <span className="text-green-600 font-medium text-sm">Approved form already sent</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center space-x-2">
                    {pr.is_sent === 0 && (
                      <button
                        onClick={() => handleSendForApproval(pr.id)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-md text-sm"
                      >
                        Send Approved Form
                      </button>
                    )}
                    <button
                      onClick={() => handlePrint(pr.id)}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded-md text-sm"
                    >
                      Print
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {purchaseRequests.links.length > 3 && (
            <div className="flex justify-center items-center gap-2 mt-6 flex-wrap">
              {purchaseRequests.links.map((link, i) => (
                <button
                  key={i}
                  disabled={!link.url}
                  onClick={() =>
                    link.url &&
                    router.visit(link.url, {
                      preserveScroll: true,
                      preserveState: true,
                    })
                  }
                  className={`px-4 py-2 text-sm rounded-md border transition ${
                    link.active
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-gray-700 hover:bg-gray-100 border-gray-300"
                  } ${!link.url && "opacity-50 cursor-not-allowed"}`}
                  dangerouslySetInnerHTML={{ __html: link.label }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </RequesterLayout>
  );
}
