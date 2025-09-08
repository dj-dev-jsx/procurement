import TooltipLink from "@/Components/Tooltip";
import { useToast } from "@/hooks/use-toast";
import RequesterLayout from "@/Layouts/RequesterLayout";
import { Head, router, usePage } from "@inertiajs/react";
import { useState, useEffect, useMemo, useCallback } from "react";
import Swal from "sweetalert2";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

export default function ManageRequests({ purchaseRequests, search: initialSearch, month: initialMonth }) {
  const { props } = usePage();
  const [search, setSearch] = useState(initialSearch || "");
  const [month, setMonth] = useState(initialMonth || "");
  const [approvalImages, setApprovalImages] = useState({});
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  useEffect(() => {
      const message = props.flash.success;
      if (message) {
        setSuccessMessage(message);
        setIsSuccessDialogOpen(true);
      }
    }, [props.flash.success]); 
    console.log(props); 
    const [highlightPrId, setHighlightPrId] = useState(null);

useEffect(() => {
  const goToLast = localStorage.getItem("goToLastPage");
  const highlightId = localStorage.getItem("highlightPrId");

  if (goToLast && highlightId) {
    const lastLink = props.purchaseRequests.links
      .filter(l => l.url)
      .slice(-1)[0];
    console.log("lastLink:", lastLink);
    if (lastLink && lastLink.url) {
      router.visit(lastLink.url, {
        preserveScroll: true,
        preserveState: true,
        onSuccess: () => {
          setHighlightPrId(highlightId);
          console.log("Set highlightPrId:", highlightId);
          localStorage.removeItem("goToLastPage");
          localStorage.removeItem("highlightPrId");
        }
      });
    }
  } else if (props.highlightPrId) {
    setHighlightPrId(props.highlightPrId);
  }
}, []);

  // ✅ Month options memoized
  const monthOptions = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        value: i + 1,
        label: new Date(0, i).toLocaleString("default", { month: "long" }),
      })),
    []
  );

  // ✅ SweetAlert helper
  const showAlert = useCallback((icon, title, text, color = "#4f46e5") => {
    Swal.fire({ icon, title, text, confirmButtonColor: color });
  }, []);

  const handleFileChange = useCallback((e, id) => {
    const file = e.target.files[0];
    if (file) {
      setApprovalImages((prev) => ({ ...prev, [id]: file }));
    }
  }, []);

  const handleSendForApproval = useCallback(
    (id) => {
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
              showAlert("success", "Sent!", "The approved PR form has been sent.");
              setApprovalImages((prev) => {
                const copy = { ...prev };
                delete copy[id];
                return copy;
              });
            },
            onError: () => {
              showAlert("error", "Error", "Failed to send approved PR form.", "#d33");
            },
          });
        }
      });
    },
    [approvalImages, showAlert]
  );

  const handlePrint = useCallback((id) => {
    window.open(route("requester.print", id), "_blank");
  }, []);

useEffect(() => {
  if (search === (initialSearch || "") && month === (initialMonth || "")) {
    return; // don't trigger on initial load
  }

  const delay = setTimeout(() => {
    router.get(route("requester.manage_requests"), { search, month }, {
      preserveScroll: true,
      preserveState: true,
      replace: true,
    });
  }, 300);

  return () => clearTimeout(delay);
}, [search, month]);


useEffect(() => {
  let interval;
  const startPolling = () => {
    interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        router.reload({
          only: ["purchaseRequests"],
          preserveScroll: true,
          preserveState: true,
        });
      }
    }, 10000);
  };

  startPolling();
  return () => clearInterval(interval);
}, []);


  return (
    <RequesterLayout header="Schools Division Office - Ilagan | Manage Requests">
      <Head title="Manage Requests" />

      <div className="bg-white rounded-lg shadow p-6 mb-6 border border-gray-200">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Your Purchase Requests</h2>
          <button
            onClick={() => router.get(route("requester.create"))}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2 rounded-md shadow"
          >
            + Create PR
          </button>
        </div>

        {/* Filters */}
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
              {monthOptions.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-md border border-gray-200 shadow-sm bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                {["PR Number", "Purpose", "Status", "Date Created", "Signed PR Form", "Actions"].map((header) => (
                  <th key={header} className="px-6 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {purchaseRequests.data.map((pr) => (
                <tr
      id={`pr-${pr.id}`}
      key={pr.id}
      className={`hover:bg-indigo-50 transition duration-200 ${
        pr.id === highlightPrId ? "bg-green-100" : ""
      }`}
    >

                  {/* PR Number */}
                  <td className="px-6 py-4 text-center text-indigo-600 font-medium">
                    {(pr.is_sent === 0 && pr.status !== "Approved") ? (
                      <TooltipLink
                        to={route("requester.add_details", pr.id)}
                        tooltip="Edit PR"
                        className="hover:underline text-indigo-600"
                      >
                        {pr.pr_number}
                      </TooltipLink>
                    ) : (
                      <span className="text-gray-500 cursor-not-allowed">{pr.pr_number}</span>
                    )}
                  </td>

                  {/* Purpose */}
                  <td className="px-6 py-4 text-center text-gray-700">{pr.purpose}</td>

                  {/* Status */}
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        pr.status === "Approved" ? "bg-green-100 text-green-800" :
                        pr.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
                        pr.status === "Rejected" ? "bg-red-100 text-red-800" :
                        "bg-gray-200 text-gray-800"
                      }`}
                    >
                      {pr.status}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="px-6 py-4 text-center text-gray-600 text-sm font-mono">
                    {new Date(pr.created_at).toLocaleDateString()}
                  </td>

                  {/* File Upload */}
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

                  {/* Actions */}
                  <td className="px-6 py-4 text-center space-x-2">
                    {pr.is_sent === 0 && (
                      <button
                        onClick={() => handleSendForApproval(pr.id)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-md text-sm"
                      >
                        Send For Approval
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
                    router.visit(link.url, { preserveScroll: true, preserveState: true })
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
    <Dialog open={isSuccessDialogOpen} onOpenChange={setIsSuccessDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle2 size={24} />
            Success!
          </DialogTitle>
          <DialogDescription className="pt-4 text-base">
            {successMessage}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={() => setIsSuccessDialogOpen(false)}>OK</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    </RequesterLayout>
  );
}
