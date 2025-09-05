import { useForm, Head, router } from "@inertiajs/react";
import SupplyOfficerLayout from "@/Layouts/SupplyOfficerLayout";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useMemo } from "react";
import {
  ClipboardSignature,
  CalendarCheck,
  Package,
  Boxes,
  MessageSquareText,
  Save,
  ScanLine,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Reusable input wrapper
const LabeledInput = ({ icon, label, children }) => (
  <div className="flex flex-col gap-1">
    <label className="text-sm font-semibold text-gray-600 flex items-center gap-2">
      {icon}
      {label}
    </label>
    {children}
  </div>
);

export default function RecordIar({ po, inspectionCommittee }) {
  const { data, setData, post, processing, errors } = useForm({
    po_id: po.id,
    iar_number: po.po_number,
    date_received: "",
    inspection_committee_id: inspectionCommittee?.id || "",
    items: (po.details || []).map((detail) => {
      const prDetail = po.rfq?.purchase_request?.details?.find(
        (pr) => pr.id === detail.pr_detail_id
      );
      return {
        pr_details_id: detail.pr_detail_id,
        product_name: prDetail?.item || "Unknown Item",
        specs: prDetail?.specs || "No specs provided",
        quantity_ordered: parseFloat(detail.quantity || 0),
        unit_price: parseFloat(detail.unit_price || 0),
        quantity_received: "",
        remarks: "",
        total_price: 0,
      };
    }),
    committee_members: (inspectionCommittee?.members || []).map((m) => ({
      id: m.id,
      name: m.name,
      position: m.position,
      status: m.status,
    })),
  });
const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  // --- ITEMS HANDLING ---
  const handleItemChange = (index, field, value) => {
    setData(
      "items",
      data.items.map((item, i) => {
        if (i === index) {
          const updatedItem = { ...item, [field]: value };
          const receivedQty = parseFloat(updatedItem.quantity_received || 0);
          updatedItem.total_price = receivedQty * updatedItem.unit_price;
          return updatedItem;
        }
        return item;
      })
    );
  };

  const grandTotal = useMemo(() => {
    return data.items.reduce((total, item) => total + item.total_price, 0);
  }, [data.items]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setConfirmDialogOpen(true); // show confirm dialog first
  };
  const handleConfirmSave = () => {
  post(route("supply_officer.store_iar"), {
    preserveScroll: true,
    onSuccess: () => {
      setConfirmDialogOpen(false);
      toast({
        title: "IAR Recorded",
        description: "Inspection & Acceptance Report successfully saved!",
        duration: 3000,
      });
    },
    onError: () => {
      toast({
        title: "Save Failed",
        description: "Please review the inputs and try again.",
        variant: "destructive",
        duration: 4000,
      });
    },
  });
};



  // --- COMMITTEE HANDLING ---
  const [replaceDialogOpen, setReplaceDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [replacementName, setReplacementName] = useState("");
  const { toast } = useToast();

  const handleReplaceMember = (member) => {
    setSelectedMember(member);
    setReplacementName("");
    setReplaceDialogOpen(true);
  };

const handleConfirmReplace = () => {
  router.post(
    route("inspection.committee.replace-member", { id: inspectionCommittee?.id }),
    {
      member_id: selectedMember.id,
      replacementName,
    },
    {
      preserveScroll: true,
      onSuccess: () => {
        // Update UI: mark old inactive, add new active
        setData(
          "committee_members",
          data.committee_members.map((m) =>
            m.id === selectedMember.id
              ? { ...m, status: "inactive" }
              : m
          ).concat({
            // backend should pass new member via props
            id: Date.now(), // fallback id (replace if backend returns real one)
            name: replacementName,
            position: selectedMember.position,
            status: "active",
          })
        );

        setReplaceDialogOpen(false);

        toast({
          title: "Member Replaced",
          description: "Inspection Committee updated successfully!",
          duration: 3000,
        });
      },
      onError: () => {
        toast({
          title: "Replace Failed",
          description: "Please check inputs and try again.",
          variant: "destructive",
          duration: 4000,
        });
      },
    }
  );
};


  return (
    <SupplyOfficerLayout header="Schools Divisions Office - Ilagan | Record Inspection and Acceptance">
      <Head title="Record IAR" />
      <div className="bg-white p-8 shadow-lg rounded-xl animate-fade-in mx-auto">
        {/* HEADER */}
        <div className="mb-6 border-b pb-4">
          <h2 className="text-3xl font-bold text-gray-800">
            Inspection & Acceptance Report
          </h2>
          <p className="text-gray-500">For Purchase Order #{po.po_number}</p>
        </div>

        {/* ERRORS */}
        {Object.keys(errors).length > 0 && (
          <div
            className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-6"
            role="alert"
          >
            <h3 className="font-bold mb-2">Please correct the following errors:</h3>
            <ul className="list-disc list-inside">
              {Object.entries(errors).map(([key, message]) => (
                <li key={key}>{message}</li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* --- Section 1: Global Information --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border rounded-lg bg-gray-50">
            <LabeledInput icon={<ClipboardSignature size={16} />} label="IAR Number">
              <input
                type="text"
                className="w-full border-gray-300 p-2 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={data.iar_number}
                onChange={(e) => setData("iar_number", e.target.value)}
                required
              />
            </LabeledInput>
            <LabeledInput icon={<CalendarCheck size={16} />} label="Date Received">
              <input
                type="date"
                className="w-full border-gray-300 p-2 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={data.date_received}
                onChange={(e) => setData("date_received", e.target.value)}
                required
              />
            </LabeledInput>
          </div>

          {/* --- Section 2: Received Items --- */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-700">Received Items</h3>
            {data.items.map((item, index) => {
              const totalReceivedPrice =
                (parseFloat(item.quantity_received) || 0) * item.unit_price;
              const hasDiscrepancy =
                parseFloat(item.quantity_received || 0) !== item.quantity_ordered;

              return (
                <div
                  key={item.pr_details_id}
                  className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm transition-all hover:shadow-md"
                >
                  {/* Item Header */}
                  <div className="flex justify-between items-start mb-4 pb-4 border-b">
                    <div>
                      <h4 className="text-lg font-semibold text-blue-800">
                        {item.product_name}
                      </h4>
                      <p className="text-sm text-gray-500">{item.specs}</p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <p className="text-sm font-bold text-gray-700">Unit Price</p>
                      <p className="text-lg font-mono text-green-700">
                        ₱{item.unit_price.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Quantities & Totals Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <LabeledInput icon={<Package size={16} />} label="Quantity Ordered">
                      <p className="w-full bg-gray-200 text-gray-800 p-2 rounded-md text-center font-bold text-lg">
                        {item.quantity_ordered}
                      </p>
                    </LabeledInput>

                    <LabeledInput icon={<Boxes size={16} />} label="Quantity Received *">
                      <input
                        type="number"
                        className={`w-full border p-2 rounded-md text-center font-bold text-lg focus:outline-none focus:ring-2 ${
                          hasDiscrepancy
                            ? "border-yellow-400 ring-yellow-300"
                            : "border-gray-300 focus:ring-blue-500"
                        }`}
                        placeholder="0"
                        value={item.quantity_received}
                        onChange={(e) =>
                          handleItemChange(index, "quantity_received", e.target.value)
                        }
                        required
                      />
                    </LabeledInput>

                    <LabeledInput icon={<ScanLine size={16} />} label="Total for Item">
                      <p className="w-full bg-blue-100 text-blue-800 p-2 rounded-md text-center font-bold text-lg">
                        ₱
                        {totalReceivedPrice.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                    </LabeledInput>
                  </div>

                  {/* Remarks */}
                  <div className="mt-6">
                    <LabeledInput icon={<MessageSquareText size={16} />} label="Remarks">
                      <textarea
                        className="w-full border-gray-300 p-2 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 resize-none"
                        placeholder="Add remarks for this item (e.g., damaged box, wrong color)"
                        value={item.remarks}
                        onChange={(e) =>
                          handleItemChange(index, "remarks", e.target.value)
                        }
                        rows={2}
                      />
                    </LabeledInput>
                  </div>
                </div>
              );
            })}
          </div>

          {/* --- Section 3: Footer & Committee --- */}
          <div className="border-t pt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="text-right">
                <p className="text-md font-semibold text-gray-600">Grand Total Received</p>
                <p className="text-3xl font-bold text-gray-800">
                  ₱
                  {grandTotal.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
            </div>

            {/* COMMITTEE MEMBERS */}
            <div className="mt-10 p-4 border rounded-lg bg-gray-50">
              <h3 className="text-xl font-bold mb-4 text-gray-700">
                Inspection Committee
              </h3>
              <ul className="space-y-3">
                {data.committee_members
                  // 1️⃣ Only keep active members
                  ?.filter((m) => m.status === "active")
                  // 2️⃣ Sort so leader always comes first
                  .sort((a, b) => {
                    if (a.position.toLowerCase() === "leader") return -1;
                    if (b.position.toLowerCase() === "leader") return 1;
                    return 0;
                  })
                  .map((member) => (
                    <li
                      key={member.id}
                      className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm"
                    >
                      <div>
                        <p className="font-semibold">{member.name}</p>
                        <p className="text-sm text-gray-500">{member.position}</p>
                      </div>

                      {/* Only active members are shown anyway, so button is always visible */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReplaceMember(member)}
                      >
                        Replace
                      </Button>
                    </li>
                  ))}
              </ul>
            </div>
            <div className="flex justify-end mt-4">
              <button
                type="submit"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-lg transition-transform transform hover:scale-105 disabled:opacity-50"
                disabled={processing}
              >
                <Save size={18} />
                {processing ? "Saving..." : "Save Inspection Report"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* REPLACE DIALOG */}
      <Dialog open={replaceDialogOpen} onOpenChange={setReplaceDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Replace Committee Member</DialogTitle>
            <DialogDescription>
              Replace <strong>{selectedMember?.name}</strong> with a new inspector.
            </DialogDescription>
          </DialogHeader>

          <input
            type="text"
            value={replacementName}
            onChange={(e) => setReplacementName(e.target.value)}
            placeholder="Enter new inspector name"
            className="w-full border px-3 py-2 rounded mt-2"
          />

          <DialogFooter className="mt-4">
            <Button variant="secondary" onClick={() => setReplaceDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmReplace}>Confirm Replace</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* CONFIRM SAVE DIALOG */}
    <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Record</DialogTitle>
          <DialogDescription>
            Are you sure you want to record this Inspection & Acceptance Report?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button variant="secondary" onClick={() => setConfirmDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirmSave}>
            Yes, Record IAR
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    </SupplyOfficerLayout>
  );
}
