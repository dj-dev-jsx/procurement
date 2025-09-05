import ApproverLayout from "@/Layouts/ApproverLayout";
import { Head, router } from "@inertiajs/react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";



export default function AbstractOfQuotations({ rfq, groupedDetails = {}, committee }) {
  const pr = rfq.purchase_request;

  const [winnerDialogOpen, setWinnerDialogOpen] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [selectedWinner, setSelectedWinner] = useState({ rfqId: null, supplierId: null });
  const [committeeDialogOpen, setCommitteeDialogOpen] = useState(false);
  const { toast } = useToast();
  const [selectedMember, setSelectedMember] = useState(null);
  const [replacementName, setReplacementName] = useState("");



  // Initialize committee state from props
  const [committeeState, setCommitteeState] = useState(() => {
    const members = {};
    const positions = ["secretariat", "member1", "member2", "member3", "vice_chair", "chair"];
    

    positions.forEach((pos) => {
      const member = committee?.members?.find((m) => m.position === pos);
      members[pos] = { name: member?.name || "", status: member?.status || "pending" };
    });

    return { status: committee?.status || "draft", members };
  });

  const handleCommitteeChange = (position, value) => {
    setCommitteeState((prev) => ({
      ...prev,
      members: { ...prev.members, [position]: { ...prev.members[position], name: value } },
    }));
  };

const handleSaveCommittee = () => {
  setCommitteeDialogOpen(true); // just opens the dialog
};

const handleConfirmSaveCommittee = () => {
  const payload = {
    id: committee?.id ?? null,
    status: committeeState.status,
    members: Object.entries(committeeState.members).map(([position, info]) => ({
      position,
      name: info.name,
      status: info.status,
    })),
  };

  router.post(route("bac.committee.save"), payload, {
    preserveScroll: true,
    onSuccess: () => {
      setCommitteeDialogOpen(false);
      toast({
        title: "Committee Saved",
        description: "BAC Committee has been updated successfully.",
        duration: 3000,
      });
    },
  });
};



  const handlePrintAOQ = (rfqId) => window.open(route("bac_approver.print_aoq", { id: rfqId }), "_blank");

  const handleOpenWinnerDialog = (rfqId, supplierId) => {
    setSelectedWinner({ rfqId, supplierId });
    setRemarks("");
    setWinnerDialogOpen(true);
  };

const handleConfirmWinner = () => {
  router.post(
    route("bac_approver.mark_winner", { id: selectedWinner.rfqId }),
    { supplier_id: selectedWinner.supplierId, remarks },
    {
      preserveScroll: true,
      onSuccess: () => {
        setWinnerDialogOpen(false);
        toast({
          title: "Winner Marked",
          description: "Supplier has been successfully awarded.",
          duration: 3000,
        });
      },
    }
  );
};

  // --- Process supplier data ---
  const supplierMap = {};
  const winnerCounts = {};

  pr.details.forEach((detail) => {
    const quotesForItem = groupedDetails[detail.id] || [];
    quotesForItem.forEach((quote) => {
      const sid = quote.supplier.id;
      if (!supplierMap[sid]) {
        supplierMap[sid] = { supplier: quote.supplier, detailIds: new Set(), total: 0 };
        winnerCounts[sid] = 0;
      }
      supplierMap[sid].detailIds.add(detail.id);
      supplierMap[sid].total += parseFloat(quote.quoted_price || 0);
      if (quote.is_winner) winnerCounts[sid]++;
    });
  });

  const totalDetailsCount = pr.details.length;
  const fullBidSuppliersData = Object.values(supplierMap).filter(
    (s) => s.detailIds.size === totalDetailsCount
  );
  const fullPrWinnerSupplierId = Object.keys(winnerCounts).find(
    (sid) => winnerCounts[sid] === totalDetailsCount && totalDetailsCount > 0
  );
  const isFullPrWinnerDeclared = !!fullPrWinnerSupplierId;
  const fullBidSuppliers = fullBidSuppliersData.map((s) => ({
    ...s,
    isWinner: s.supplier.id == fullPrWinnerSupplierId,
  }));


  return (
    <ApproverLayout>
      <Head title={`Abstract for ${pr.pr_number}`} />
      <div className="px-8 py-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Abstract of Quotations – PR #{pr.pr_number}
        </h2>

        <div className="mb-4 flex justify-between items-center">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-md text-sm shadow-sm"
          >
            ← Back
          </button>
        </div>

        {/* FULL PR MODE */}
        <div className="mb-10 border p-4 rounded-lg bg-white shadow-sm">
          <div className="flex justify-between items-start p-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Comparison for Entire Purchase Request</h3>
              <div className="text-sm text-gray-700">
                <p>
                  <strong>Focal Person:</strong> {pr.focal_person.firstname} {pr.focal_person.lastname}
                </p>
                <p>
                  <strong>Division:</strong> {pr.division.division}
                </p>
              </div>
            </div>
            <button
              onClick={() => handlePrintAOQ(rfq.id)}
              className="text-sm text-white bg-green-600 hover:bg-green-700 px-3 py-2 rounded-md h-fit"
            >
              🖨️ Print Full AOQ
            </button>
          </div>

          <table className="w-full text-sm border">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-4 py-2 text-left">Supplier Representative</th>
                <th className="border px-4 py-2 text-left">Company Name</th>
                <th className="border px-4 py-2 text-right">Total Quoted Price</th>
                <th className="border px-4 py-2 text-center">Winner</th>
                <th className="border px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {fullBidSuppliers.map((sEntry) => (
                <tr key={sEntry.supplier.id}>
                  <td className="border px-4 py-2">{sEntry.supplier.representative_name}</td>
                  <td className="border px-4 py-2">{sEntry.supplier.company_name}</td>
                  <td className="border px-4 py-2 text-right">
                    ₱{sEntry.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="border px-4 py-2 text-center font-bold text-green-600">
                    {sEntry.isWinner ? "✔️" : ""}
                  </td>
                  <td className="border px-4 py-2 text-center">
                    {!isFullPrWinnerDeclared && (
                      <button
                        onClick={() => handleOpenWinnerDialog(rfq.id, sEntry.supplier.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded"
                      >
                        Mark as Winner
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>


        <div className="mb-8 p-4 border rounded-lg bg-gray-50 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">BAC Committee</h3>
          <ul className="space-y-3">
            {[
              "chair",
              "vice_chair",
              "secretariat",
              "member1",
              "member2",
              "member3",
            ].map((position) => {
              const info = committeeState.members[position];
              return (
                <li
                  key={position}
                  className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm"
                >
                  <div>
                    <p className="font-semibold">
                      {info?.name || "—"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {position.replace("_", " ").toUpperCase()}
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedMember({ position, current: info });
                      setReplacementName("");
                      setCommitteeDialogOpen(true);
                    }}
                  >
                    Replace
                  </Button>
                </li>
              );
            })}
          </ul>
        </div>


      </div>

      {/* WINNER CONFIRMATION DIALOG */}
      <Dialog open={winnerDialogOpen} onOpenChange={setWinnerDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Mark as Winner</DialogTitle>
            <DialogDescription>
              Please provide remarks for awarding this supplier.
            </DialogDescription>
          </DialogHeader>

          <Textarea
            placeholder="Enter remarks..."
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            className="mt-2"
          />

          <DialogFooter className="mt-4">
            <Button variant="secondary" onClick={() => setWinnerDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmWinner}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={committeeDialogOpen} onOpenChange={setCommitteeDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Replace Committee Member</DialogTitle>
            <DialogDescription>
              Enter a new member to replace{" "}
              <strong>{selectedMember?.current?.name || "N/A"}</strong> (
              {selectedMember?.position.replace("_", " ").toUpperCase()}).
            </DialogDescription>
          </DialogHeader>

          <input
            type="text"
            value={replacementName}
            onChange={(e) => setReplacementName(e.target.value)}
            placeholder="Enter new member name"
            className="w-full border px-3 py-2 rounded mb-2"
          />

          <DialogFooter className="mt-4">
            <Button
              variant="secondary"
              onClick={() => setCommitteeDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!replacementName.trim()) return;

                setCommitteeState((prev) => ({
                  ...prev,
                  members: {
                    ...prev.members,
                    [selectedMember.position]: {
                      name: replacementName.trim(),
                      status: "active",
                    },
                  },
                }));

                setCommitteeDialogOpen(false);
                toast({
                  title: "Member Replaced",
                  description: `${selectedMember.position.replace(
                    "_",
                    " "
                  )} updated successfully.`,
                  duration: 3000,
                });
              }}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>



    </ApproverLayout>
  );
}
