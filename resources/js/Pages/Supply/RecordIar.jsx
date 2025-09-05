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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState, useMemo } from "react";
import {
  ClipboardSignature,
  CalendarCheck,
  Package,
  Boxes,
  MessageSquareText,
  Save,
  ScanLine,
  Users, // Added for committee section
  BadgeDollarSign, // Added for unit price
  Info, // Added for discrepancy icon
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Reusable input wrapper
const LabeledInput = ({ icon, label, children, error, className = "" }) => (
  <div className={`flex flex-col gap-2 ${className}`}>
    <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
      {icon}
      {label}
    </Label>
    {children}
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

// Helper function to format date to YYYY-MM-DD
const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function RecordIar({ po, inspectionCommittee }) {
  const { data, setData, post, processing, errors } = useForm({
    po_id: po.id,
    iar_number: po.po_number,
    date_received: getTodayDate(), // Prefill with today's date
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
  const { toast } = useToast(); // Initialize useToast here

  // --- ITEMS HANDLING ---
const handleItemChange = (index, field, value) => {
  setData(
    "items",
    data.items.map((item, i) => {
      if (i === index) {
        const updatedItem = { ...item };

        if (field === "quantity_received") {
          let receivedQty = parseFloat(value) || 0;

          // ✅ Prevent exceeding ordered qty
          if (receivedQty > item.quantity_ordered) {
            receivedQty = item.quantity_ordered;
          }

          updatedItem.quantity_received = receivedQty;
          updatedItem.total_price = receivedQty * updatedItem.unit_price;
        } else {
          updatedItem[field] = value;
        }

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
      onError: (errors) => { // Catch errors passed from Inertia
        setConfirmDialogOpen(false); // Close dialog on error as well
        console.error("IAR Save Error:", errors); // Log errors for debugging
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
          // Update UI: mark old inactive, add new active (assuming backend returns updated committee members)
          // For now, client-side optimistic update:
          setData(
            "committee_members",
            data.committee_members
              .map((m) =>
                m.id === selectedMember.id
                  ? { ...m, status: "inactive" }
                  : m
              )
              .concat({
                // This is a placeholder; ideally, the backend should return the new member or entire updated list.
                id: Date.now(), // Unique ID, replace if backend returns real one
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
        onError: (errors) => { // Catch errors passed from Inertia
          setReplaceDialogOpen(false); // Close dialog on error as well
          console.error("Member Replace Error:", errors); // Log errors for debugging
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
      <div className="min-h-screen bg-gray-100 p-8 pt-10">
        <div className="bg-white p-10 shadow-xl rounded-2xl">
          {/* HEADER */}
          <div className="mb-10 pb-6 border-b border-gray-200">
            <h2 className="text-4xl font-extrabold text-gray-900 leading-tight">
              Record Inspection and Acceptance Report
            </h2>
            <p className="text-lg text-gray-600 mt-2">
              For Purchase Order <span className="font-semibold text-blue-700">#{po.po_number}</span>
            </p>
          </div>

          {/* Global ERRORS */}
          {Object.keys(errors).length > 0 && (
            <div
              className="bg-red-50 border-l-4 border-red-400 text-red-800 p-4 rounded-md mb-8 shadow-sm"
              role="alert"
            >
              <h3 className="font-bold text-lg mb-2">Please correct the following errors:</h3>
              <ul className="list-disc list-inside text-sm">
                {Object.entries(errors).map(([key, message]) => (
                  // Only show top-level errors, individual field errors will be shown next to fields
                  // Filter out item-specific errors here, as they are shown inline
                  !key.startsWith('items.') && <li key={key}>{message}</li>
                ))}
              </ul>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-12">
            {/* --- Section 1: Global Information --- */}
            <section className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                <ClipboardSignature size={24} className="text-blue-600" />
                Global Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 border border-gray-200 rounded-xl bg-gradient-to-br from-blue-50 to-white shadow-md">
                <LabeledInput
                  icon={<ScanLine size={18} className="text-gray-500" />}
                  label="IAR Number"
                  error={errors.iar_number} // Error for iar_number
                >
                  <Input
                    type="text"
                    value={data.iar_number}
                    onChange={(e) => setData("iar_number", e.target.value)}
                    placeholder="Enter IAR Number"
                    className="h-12 text-base"
                    required
                  />
                </LabeledInput>
                <LabeledInput
                  icon={<CalendarCheck size={18} className="text-gray-500" />}
                  label="Date Received"
                  error={errors.date_received} // Error for date_received
                >
                  <Input
                    type="date"
                    value={data.date_received}
                    onChange={(e) => setData("date_received", e.target.value)}
                    className="h-12 text-base"
                    required
                  />
                </LabeledInput>
              </div>
            </section>

            {/* --- Section 2: Received Items --- */}
            <section className="space-y-8">
              <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                <Boxes size={24} className="text-blue-600" />
                Received Items
              </h3>
              {data.items.map((item, index) => {
                const totalReceivedPrice =
                  (parseFloat(item.quantity_received) || 0) * item.unit_price;
                const hasDiscrepancy =
                  parseFloat(item.quantity_received || 0) !== item.quantity_ordered &&
                  parseFloat(item.quantity_received || 0) > 0; // Only show discrepancy if something was actually received

                return (
                  <div
                    key={item.pr_details_id}
                    className="bg-white border border-gray-200 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out"
                  >
                    {/* Item Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-6 border-b border-gray-100">
                      <div>
                        <h4 className="text-xl font-semibold text-blue-800 leading-snug">
                          {item.product_name}
                        </h4>
                        <p className="text-md text-gray-600 mt-1">{item.specs}</p>
                      </div>
                      <div className="text-right sm:ml-4 mt-4 sm:mt-0">
                        <p className="text-sm font-medium text-gray-600 flex items-center justify-end gap-1">
                          <BadgeDollarSign size={16} /> Unit Price
                        </p>
                        <p className="text-2xl font-extrabold text-green-700 tracking-wide">
                          ₱{item.unit_price.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Quantities & Totals Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <LabeledInput icon={<Package size={18} />} label="Quantity Ordered">
                        <Input
                          type="text"
                          className="bg-gray-50 text-gray-800 text-center font-bold text-xl h-14 border-gray-200 cursor-not-allowed"
                          value={item.quantity_ordered}
                          readOnly
                        />
                      </LabeledInput>

                      <LabeledInput
                        icon={<Boxes size={18} />}
                        label="Quantity Received *"
                        error={errors[`items.${index}.quantity_received`]} // Error for item quantity received
                      >
                        <Input
                          type="number"
                          className={`text-center font-bold text-xl h-14 ${
                            hasDiscrepancy
                              ? "border-yellow-500 focus-visible:ring-yellow-400 ring-4 ring-yellow-200"
                              : "border-gray-300"
                          } transition-all duration-200`}
                          placeholder="0"
                          value={item.quantity_received}
                          onChange={(e) =>
                            handleItemChange(index, "quantity_received", e.target.value)
                          }
                          min="0"
                          required
                        />
                         {hasDiscrepancy && (
                            <p className="text-yellow-600 text-sm mt-1 flex items-center gap-1">
                                <Info size={14} /> Discrepancy with ordered quantity.
                            </p>
                        )}
                      </LabeledInput>

                      <LabeledInput icon={<ScanLine size={18} />} label="Total for Item">
                        <Input
                          type="text"
                          className="bg-blue-50 text-blue-800 text-center font-extrabold text-xl h-14 border-blue-200 cursor-not-allowed"
                          value={totalReceivedPrice.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                          readOnly
                        />
                      </LabeledInput>
                    </div>

                    {/* Remarks */}
                    <div className="mt-8">
                      <LabeledInput
                        icon={<MessageSquareText size={18} />}
                        label="Remarks"
                        error={errors[`items.${index}.remarks`]} // Error for item remarks
                      >
                        <Textarea
                          placeholder="Add remarks for this item (e.g., damaged box, wrong color, incomplete delivery)"
                          value={item.remarks}
                          onChange={(e) =>
                            handleItemChange(index, "remarks", e.target.value)
                          }
                          rows={3}
                          className="min-h-[80px]"
                          required
                        />
                      </LabeledInput>
                    </div>
                  </div>
                );
              })}
            </section>

            {/* --- Section 3: Footer & Committee --- */}
            <section className="border-t border-gray-200 pt-10 space-y-10">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-end">
                {/* COMMITTEE MEMBERS */}
                <div className="lg:col-span-2 p-8 border border-gray-200 rounded-xl bg-gray-50 shadow-md">
                  <h3 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-3">
                    <Users size={24} className="text-blue-600" />
                    Inspection Committee
                  </h3>
                  <ul className="space-y-4">
                    {data.committee_members
                      ?.filter((m) => m.status === "active")
                      .sort((a, b) => {
                        if (a.position.toLowerCase().includes("leader")) return -1;
                        if (b.position.toLowerCase().includes("leader")) return 1;
                        return 0;
                      })
                      .map((member) => (
                        <li
                          key={member.id}
                          className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white p-5 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100"
                        >
                          <div className="mb-2 sm:mb-0">
                            <p className="font-semibold text-lg text-gray-800">{member.name}</p>
                            <p className="text-sm text-gray-500">{member.position}</p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleReplaceMember(member)}
                            className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                          >
                            Replace
                          </Button>
                        </li>
                      ))}
                  </ul>
                </div>

                {/* Grand Total */}
                <div className="lg:col-span-1 flex justify-center lg:justify-end">
                  <div className="text-center p-8 rounded-xl bg-blue-600 text-white shadow-xl min-w-[280px]">
                    <p className="text-lg font-semibold mb-2 opacity-90">Grand Total Received</p>
                    <p className="text-5xl font-extrabold tracking-tight">
                      ₱
                      {grandTotal.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-10">
                <Button
                  type="submit"
                  className="px-10 py-4 text-lg bg-blue-700 hover:bg-blue-800 text-white flex items-center gap-3 shadow-lg transition-all transform hover:-translate-y-1 hover:shadow-xl rounded-xl"
                  disabled={processing}
                >
                  <Save size={20} />
                  {processing ? "Saving..." : "Save Inspection Report"}
                </Button>
              </div>
            </section>
          </form>
        </div>
      </div>

      {/* REPLACE DIALOG */}
      <Dialog open={replaceDialogOpen} onOpenChange={setReplaceDialogOpen}>
        <DialogContent className="sm:max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Replace Committee Member</DialogTitle>
            <DialogDescription className="text-md text-gray-600">
              Replace <strong className="text-blue-700">{selectedMember?.name}</strong> with a new inspector.
            </DialogDescription>
          </DialogHeader>

          <LabeledInput label="New Inspector Name" className="mt-4" error={errors.replacementName}> {/* Error for replacementName */}
            <Input
              type="text"
              value={replacementName}
              onChange={(e) => setReplacementName(e.target.value)}
              placeholder="Enter new inspector's full name"
              className="h-10 text-base"
            />
          </LabeledInput>

          <DialogFooter className="mt-6 flex justify-end gap-3">
            <Button variant="outline" onClick={() => setReplaceDialogOpen(false)} className="px-6 py-2">
              Cancel
            </Button>
            <Button onClick={handleConfirmReplace} className="px-6 py-2 bg-blue-600 hover:bg-blue-700">
              Confirm Replace
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CONFIRM SAVE DIALOG */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="sm:max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Confirm Record IAR</DialogTitle>
            <DialogDescription className="text-md text-gray-600">
              Are you sure you want to record this Inspection & Acceptance Report?
              Please ensure all details are correct.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 flex justify-end gap-3">
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)} className="px-6 py-2">
              Cancel
            </Button>
            <Button onClick={handleConfirmSave} className="px-6 py-2 bg-green-600 hover:bg-green-700">
              Yes, Record IAR
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SupplyOfficerLayout>
  );
}