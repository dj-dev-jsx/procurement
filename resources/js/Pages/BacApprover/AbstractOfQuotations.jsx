import ApproverLayout from "@/Layouts/ApproverLayout";
import { Head, router } from "@inertiajs/react";
import { useEffect, useState } from "react";
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
  const [resultDialog, setResultDialog] = useState({
  open: false,
  type: "success", // "success" | "error"
  title: "",
  description: "",
});

  const [selectedWinner, setSelectedWinner] = useState({
    rfqId: null,
    supplierId: null,
    detailId: null,
  });
  const [committeeDialogOpen, setCommitteeDialogOpen] = useState(false);
  const { toast } = useToast();
  const [selectedMember, setSelectedMember] = useState(null);
  const [replacementName, setReplacementName] = useState("");
  const [awardMode, setAwardMode] = useState(rfq.award_mode ?? "whole-pr");

  // Initialize committee state from props
  const [committeeState, setCommitteeState] = useState(() => {
    const members = {};
    const positions = ["secretariat", "member1", "member2", "member3", "vice_chair", "chair"];

    positions.forEach((pos) => {
      const activeMember = committee?.members
        ?.filter((m) => m.position === pos)
        ?.find((m) => m.status === "active");

      members[pos] = {
        name: activeMember?.name || "",
        status: activeMember?.status || "inactive", // 👈 fallback is inactive
      };
    });


    return { status: committee?.status || "draft", members };
  });
  console.log(committeeState);
const [rollbackDialogOpen, setRollbackDialogOpen] = useState(false);
const [rollbackTarget, setRollbackTarget] = useState(null);
const [savingCommittee, setSavingCommittee] = useState(false);
const [rollingBack, setRollingBack] = useState(false);
const [confirmingWinner, setConfirmingWinner] = useState(false);

const handleOpenRollbackDialog = (rfqId, supplierId, detailId = null) => {
  setRollbackTarget({ rfqId, supplierId, detailId });
  setRemarks("");
  setRollbackDialogOpen(true);
};

const handleConfirmRollback = () => {
  setRollingBack(true);
  const payload = {
    remarks,
    mode: awardMode,
    ...(awardMode === "per-item" ? { detail_id: rollbackTarget.detailId } : {}),
  };

  router.post(route("bac_approver.rollback_winner", { id: rollbackTarget.rfqId }), payload, {
    preserveScroll: true,
    onSuccess: () => {
      setRollbackDialogOpen(false);
      setRollingBack(false);
      setResultDialog({
        open: true,
        type: "success",
        title: "Rollback Successful",
        description: "Winner selection has been rolled back.",
      });
      toast({
        title: "Rollback Successful",
        description: "Winner selection has been rolled back.",
        duration: 3000,
      });
    },
    onError: () => {
      setRollingBack(false);
      setResultDialog({
        open: true,
        type: "error",
        title: "Rollback Failed",
        description: "Unable to rollback winner. Please try again.",
      });
    },
  });
};





  const handlePrintAOQ = (rfqId) =>
    window.open(route("bac_approver.print_aoq", { id: rfqId }), "_blank");
  const handlePrintItemAOQ = (rfqId, detailId) =>
  window.open(route("bac_approver.print_aoq", { id: rfqId, pr_detail_id: detailId }), "_blank");


  const handleOpenWinnerDialog = (rfqId, supplierId, detailId = null) => {
    setSelectedWinner({ rfqId, supplierId, detailId });
    setRemarks("");
    setWinnerDialogOpen(true);
  };

const handleConfirmWinner = () => {
  setConfirmingWinner(true);
  const payload = {
    supplier_id: selectedWinner.supplierId,
    remarks,
    mode: awardMode, // 👈 now aligned with backend award_mode column
    ...(awardMode === "per-item" ? { detail_id: selectedWinner.detailId } : {}),
  };

  router.post(route("bac_approver.mark_winner", { id: selectedWinner.rfqId }), payload, {
    preserveScroll: true,
    onSuccess: () => {
      setWinnerDialogOpen(false);
      setConfirmingWinner(false);
        setResultDialog({
        open: true,
        type: "success",
        title: "Winner Marked",
        description: awardMode === "per-item"
          ? "Supplier has been awarded for the selected item."
          : "Supplier has been awarded for the entire PR.",
      });
      toast({
        title: "Winner Marked",
        description:
          awardMode === "per-item"
            ? "Supplier has been awarded for the selected item."
            : "Supplier has been awarded for the entire PR.",
        duration: 3000,
      });
    },
    onError: () => {
      setConfirmingWinner(false);
      setResultDialog({
        open: true,
        type: "error",
        title: "Failed to Mark Winner",
        description: "Something went wrong while marking the winner. Please try again.",
      });
    },
  });
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
const fullBidSuppliers = Object.values(supplierMap).filter(
  (s) => s.detailIds.size === totalDetailsCount
);

  const hasFullBidSuppliers = fullBidSuppliers.length > 0;

  // Ensure awardMode is valid
  useEffect(() => {
    if (!hasFullBidSuppliers && awardMode === "whole-pr") {
      setAwardMode("per-item");
    }
  }, [hasFullBidSuppliers, awardMode]);
  const hasAnyWinner = pr.details.some((detail) =>
  (groupedDetails[detail.id] || []).some((q) => q.is_winner)
);

// Check if PR-wide winner is declared (all items for one supplier are marked)
const hasWholePrWinner = Object.values(winnerCounts).some(
  (count) => count === totalDetailsCount
);

// Check if per-item winners exist
const hasPerItemWinners = pr.details.some((detail) =>
  (groupedDetails[detail.id] || []).some((q) => q.is_winner)
);



  return (
    <ApproverLayout>
      <Head title={`Abstract for ${pr.pr_number}`} />
      <div className="px-8 py-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Abstract of Quotations – PR #{pr.pr_number}
        </h2>

        {/* Back Button */}
        <div className="mb-4 flex justify-between items-center">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-md text-sm shadow-sm"
          >
            ← Back
          </button>
        </div>

        {/* Mode Selector */}
      <div className="mb-6 flex gap-4">
        <Button
          variant={awardMode === "whole-pr" ? "default" : "outline"}
          onClick={() => setAwardMode("whole-pr")}
          disabled={!!rfq.award_mode} // disable if mode already chosen
        >
          Winner for Entire PR
        </Button>
        <Button
          variant={awardMode === "per-item" ? "default" : "outline"}
          onClick={() => setAwardMode("per-item")}
          disabled={!!rfq.award_mode} // disable if mode already chosen
        >
          Winner per Item
        </Button>
      </div>



        {!hasFullBidSuppliers && (
          <p className="text-sm text-red-600 mb-4">
            ⚠️ No supplier quoted for all items. You can only declare winners per item.
          </p>
        )}

        {/* WHOLE PR MODE */}
        {awardMode === "whole-pr" && (
          <div className="mb-10 border p-4 rounded-lg bg-white shadow-sm">
            <div className="flex justify-between items-start p-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Comparison for Entire Purchase Request
                </h3>
                <div className="text-sm text-gray-700">
                  <p>
                    <strong>Focal Person:</strong> {pr.focal_person.firstname}{" "}
                    {pr.focal_person.lastname}
                  </p>
                  <p>
                    <strong>Division:</strong> {pr.division.division}
                  </p>
                </div>

                {/* 📝 Add note if only 1 supplier submitted full bid */}
                {fullBidSuppliers.length === 1 && (
                  <p className="mt-2 text-sm text-orange-600 font-medium">
                    ⚠️ Note: Only one supplier submitted quotes for the entire PR.
                  </p>
                )}
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
                  <th className="border px-4 py-2">Supplier</th>
                  {pr.details.map((detail) => (
                    <th key={detail.id} className="border px-2 py-2 text-center text-xs">
                      {detail.item}
                    </th>
                  ))}
                  <th className="border px-4 py-2 text-right">Total Quoted Price</th>
                  <th className="border px-4 py-2 text-center">Winner</th>
                </tr>
              </thead>
              <tbody>
                {fullBidSuppliers.map((s) => (
                  <tr key={s.supplier.id}>
                    <td className="border px-4 py-2">{s.supplier.company_name}</td>
                    {pr.details.map((detail) => {
                      const quotes = groupedDetails[detail.id] || [];
                      const quote = quotes.find((q) => q.supplier.id === s.supplier.id);
                      return (
                        <td key={detail.id} className="border px-2 py-1 text-center">
                          {quote ? `₱${parseFloat(quote.quoted_price).toLocaleString()}` : "—"}
                        </td>
                      );
                    })}
                    <td className="border px-4 py-2 text-right">
                      ₱{parseFloat(s.total).toLocaleString()}
                    </td>
                    <td className="border px-4 py-2 text-center">
                      {winnerCounts[s.supplier.id] === totalDetailsCount ? (
                        <>
                          ✔️
                          <Button
                            size="sm"
                            variant="destructive"
                            className="ml-2"
                            onClick={() => handleOpenRollbackDialog(rfq.id, s.supplier.id)}
                          >
                            Rollback
                          </Button>
                        </>
                      ) : hasAnyWinner ? (
                        "—"
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleOpenWinnerDialog(rfq.id, s.supplier.id)}
                        >
                          Mark as Winner
                        </Button>
                      )}
                    </td>


                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}


        {/* PER ITEM MODE */}
        {awardMode === "per-item" && (
          <div className="space-y-8 mb-10 border p-4 rounded-lg bg-white shadow-sm">
            {pr.details.map((detail) => {
               const quotes = groupedDetails[detail.id] || [];
              const itemHasWinner = quotes.some((q) => q.is_winner); 
              return (
                <div
                  key={detail.id}
                  className="border p-4 bg-white rounded-lg shadow-sm"
                >
                  {/* Header with Print Button */}
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold">{detail.item}</h4>
                    <button
                      onClick={() => handlePrintItemAOQ(rfq.id, detail.id)}
                      className="text-sm text-white bg-green-600 hover:bg-green-700 px-3 py-2 rounded-md"
                    >
                      🖨️ Print AOQ
                    </button>
                  </div>

                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Description:</strong> {detail.specs || "—"} <br />
                    <strong>Quantity:</strong> {detail.quantity} {detail.unit} <br />
                  </p>

                  <table className="w-full text-sm border rounded-lg overflow-hidden">
                    <thead className="bg-gray-100 text-gray-700">
                      <tr>
                        <th className="px-4 py-2 text-left">Supplier</th>
                        <th className="px-4 py-2 text-right">Quoted Price</th>
                        <th className="px-4 py-2 text-center">Winner</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {quotes.map((q, idx) => (
                        <tr key={idx} className="odd:bg-white even:bg-gray-50">
                          <td className="px-4 py-2">{q.supplier.company_name}</td>
                          <td className="px-4 py-2 text-right">
                            ₱{parseFloat(q.quoted_price || 0).toLocaleString()}
                          </td>
                          <td className="px-4 py-2 text-center">
                            {q.is_winner ? (
                              <div className="flex justify-center items-center gap-2">
                                <span className="text-green-600 font-bold">✔️</span>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() =>
                                    handleOpenRollbackDialog(rfq.id, q.supplier.id, detail.id)
                                  }
                                >
                                  Rollback
                                </Button>
                              </div>
                            ) : itemHasWinner ? (
                              <span className="text-gray-400">—</span>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleOpenWinnerDialog(rfq.id, q.supplier.id, detail.id)
                                }
                              >
                                Mark as Winner
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                </div>
              );
            })}
          </div>
        )}


        {/* BAC COMMITTEE */}
<div className="mb-8 p-4 border rounded-lg bg-gray-50 shadow-sm">
  <h3 className="text-lg font-semibold mb-4">BAC Committee</h3>
  <ul className="space-y-3">
    {["chair", "vice_chair", "secretariat", "member1", "member2", "member3"].map(
      (position) => {
        const info = committeeState.members[position];
        return (
          info?.status === "active" && (   // ✅ Only render if active
            <li
              key={position}
              className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm"
            >
              <div>
                <p className="font-semibold">{info.name || "—"}</p>
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
          )
        );
      }
    )}
  </ul>
</div>



      </div>

      {/* WINNER CONFIRMATION DIALOG */}
      <Dialog open={winnerDialogOpen} onOpenChange={setWinnerDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Winner</DialogTitle>
            <DialogDescription>Provide remarks for awarding this supplier.</DialogDescription>
          </DialogHeader>
          <Textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} />
          <DialogFooter>
            <Button variant="secondary" onClick={() => setWinnerDialogOpen(false)}>
              Cancel
            </Button>
            <Button disabled={confirmingWinner} onClick={handleConfirmWinner}>{confirmingWinner ? "Confirming Winner..." : "Confirm" }</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* COMMITTEE REPLACEMENT DIALOG */}
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
            <Button variant="secondary" onClick={() => setCommitteeDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={savingCommittee}
              onClick={() => {
                if (!replacementName.trim()) return;
                setSavingCommittee(true);
                // 1. Update local state immediately
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

                // 2. Build payload for backend
                const payload = {
                  id: committee?.id ?? null,
                  status: committeeState.status,
                  members: Object.entries({
                    ...committeeState.members,
                    [selectedMember.position]: {
                      name: replacementName.trim(),
                      status: "active",
                    },
                  }).map(([position, info]) => ({
                    position,
                    name: info.name,
                    status: info.status,
                  })),
                };

                // 3. Submit to backend
                router.post(route("bac.committee.save"), payload, {
                  preserveScroll: true,
                  onSuccess: () => {
                    setSavingCommittee(false);
                    setCommitteeDialogOpen(false);
                    setResultDialog({
                      open: true,
                      type: "success",
                      title: "Committee Updated",
                      description: `${selectedMember.position.replace("_", " ")} replaced successfully.`,
                    });
                    toast({
                      title: "Committee Updated",
                      description: `${selectedMember.position.replace("_", " ")} replaced successfully.`,
                      duration: 3000,
                    });
                  },
                  onError: () => {
                    setSavingCommittee(false);
                    setResultDialog({
                      open: true,
                      type: "error",
                      title: "Committee Update Failed",
                      description: "Unable to replace committee member. Please try again.",
                    });
                  },
                });
              }}
            >
              {savingCommittee ? "Saving..." : "Confirm"}
            </Button>

          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={rollbackDialogOpen} onOpenChange={setRollbackDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rollback Winner</DialogTitle>
            <DialogDescription>
              Provide remarks for rolling back this winner selection.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />
          <DialogFooter>
            <Button variant="secondary" onClick={() => setRollbackDialogOpen(false)}>
              Cancel
            </Button>
            <Button disabled={rollingBack} variant="destructive" onClick={handleConfirmRollback}>
              {rollingBack ? "Rolling Back Winner..." : "Confirm Rollback"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    {/* RESULT DIALOG */}
    <Dialog open={resultDialog.open} onOpenChange={(open) => setResultDialog(prev => ({ ...prev, open }))}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className={resultDialog.type === "error" ? "text-red-600" : "text-green-600"}>
            {resultDialog.title}
          </DialogTitle>
          <DialogDescription>{resultDialog.description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={() => setResultDialog(prev => ({ ...prev, open: false }))}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    </ApproverLayout>
  );
}
