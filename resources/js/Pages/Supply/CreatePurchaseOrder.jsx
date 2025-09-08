import { Head, useForm } from "@inertiajs/react";
import { useEffect, useState, useMemo } from "react";
import SupplyOfficerLayout from "@/Layouts/SupplyOfficerLayout";
import { AlertTriangle } from "lucide-react";

// 1. Import Shadcn Dialog components and Button
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function CreatePurchaseOrder({ pr, rfq, suppliers, winners, supplierQuotedPrices }) {

  const winningSupplierIds = useMemo(() => [...new Set(winners.map(w => w.supplier_id))], [winners]);
  const winningSuppliers = useMemo(() => suppliers.filter(s => winningSupplierIds.includes(s.id)), [suppliers, winningSupplierIds]);
  const otherSuppliers = useMemo(() => suppliers.filter(s => !winningSupplierIds.includes(s.id)), [suppliers, winningSupplierIds]);
  const initialSupplierId = winningSuppliers.length > 0 ? winningSuppliers[0].id : "";
  const [isReasonDialogOpen, setIsReasonDialogOpen] = useState(false);
  const [pendingChange, setPendingChange] = useState(null); // store item index + new value
  const [reason, setReason] = useState("");

  const getItemsForSupplier = (supplierId) => {
    if (!supplierId) return [];
    return pr.details.map((prDetail) => {
      const hasQuote = supplierQuotedPrices[supplierId]?.[prDetail.id] !== undefined;
      const unit_price = hasQuote ? supplierQuotedPrices[supplierId][prDetail.id] : prDetail.unit_price;
      const quantityAsNumber = parseFloat(prDetail.quantity || 0);
      const unitPriceAsNumber = parseFloat(unit_price || 0);
      const total_price = quantityAsNumber * unitPriceAsNumber;
      return {
        pr_detail_id: prDetail.id,
        item: prDetail.product.name,
        specs: prDetail.product.specs,
        unit: prDetail.product.unit.unit,
        quantity: quantityAsNumber,
        unit_price: unitPriceAsNumber,
        total_price,
        priceSource: hasQuote ? 'Quoted Price' : 'Default Price (ABC)',
      };
    });
  };

  // --- 2. STATE MANAGEMENT ---
  const [selectedSupplierId, setSelectedSupplierId] = useState(initialSupplierId);
  // Add state to manage the confirmation dialog
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  const { data, setData, post, processing, errors } = useForm({
    rfq_id: rfq.id,
    supplier_id: initialSupplierId,
    items: getItemsForSupplier(initialSupplierId),
  });

  useEffect(() => {
    if (selectedSupplierId !== data.supplier_id) {
      setData({
        rfq_id: rfq.id,
        supplier_id: selectedSupplierId,
        items: getItemsForSupplier(selectedSupplierId),
      });
    }
  }, [selectedSupplierId]);

  const handleChange = (index, field, value) => {
    if (field === "quantity") {
      const numericValue = Number(value) >= 0 ? Number(value) : 0;

      // If changed from original PR quantity, ask for reason
      const originalQty = pr.details.find((d) => d.id === data.items[index].pr_detail_id)?.quantity;
      if (numericValue !== originalQty) {
        setPendingChange({ index, field, value: numericValue });
        setIsReasonDialogOpen(true);
        return; // don’t update yet until reason is given
      }
    }

    // Normal update for other fields
    const updatedItems = [...data.items];
    const numericValue = Number(value) >= 0 ? Number(value) : 0;
    updatedItems[index][field] = numericValue;
    updatedItems[index].total_price =
      Number(updatedItems[index].quantity) * Number(updatedItems[index].unit_price);
    setData("items", updatedItems);
  };
  const handleConfirmReason = () => {
  if (!pendingChange) return;

  const { index, field, value } = pendingChange;
  const updatedItems = [...data.items];
  updatedItems[index][field] = value;
  updatedItems[index].total_price =
    Number(updatedItems[index].quantity) * Number(updatedItems[index].unit_price);

  // Store reason for auditing
  updatedItems[index].change_reason = reason;

  setData("items", updatedItems);
  setPendingChange(null);
  setReason("");
  setIsReasonDialogOpen(false);
};

  // 3. This function now opens the dialog instead of submitting directly
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsConfirmDialogOpen(true);
  };

  // 4. This new function will be called when the user confirms in the dialog
  const handleConfirmSubmit = () => {
    post(route("supply_officer.store_po"), {
      onFinish: () => {
        setIsConfirmDialogOpen(false); // Close dialog after submission
      },
    });
  };

  return (
    <SupplyOfficerLayout header={"Schools Divisions Office - Ilagan | Create Purchase Order"}>
      <Head title={`Create PO for PR #${pr.pr_number}`} />
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow mx-auto max-w-6xl">
        <h2 className="text-2xl font-bold mb-6">Create PO for PR #{pr.pr_number}</h2>

        {/* --- SUPPLIER SELECTOR --- */}
        <div className="mb-6">
            <label htmlFor="supplier-select" className="block text-sm font-semibold text-gray-700 mb-1">
                Supplier
            </label>
            <select
                id="supplier-select"
                value={selectedSupplierId}
                onChange={(e) => setSelectedSupplierId(e.target.value ? parseInt(e.target.value) : "")}
                className="w-full md:w-1/2 border border-gray-300 rounded px-3 py-2 bg-white"
                required
            >
                <option value="">-- Select a supplier --</option>
                {winningSuppliers.length > 0 && (
                <optgroup label="Winning Supplier(s)">
                    {winningSuppliers.map((s) => <option key={s.id} value={s.id}>{s.company_name}</option>)}
                </optgroup>
                )}
                {otherSuppliers.length > 0 && (
                <optgroup label="Other Bidders">
                    {otherSuppliers.map((s) => <option key={s.id} value={s.id}>{s.company_name}</option>)}
                </optgroup>
                )}
            </select>
        </div>

        {/* --- ITEM TABLE --- (No changes here) */}
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-separate border-spacing-0 text-sm">
            {/* ... table head and body ... */}
             <thead className="bg-gray-100">
               <tr>
                <th className="border-y border-l px-4 py-2 text-left">Item</th>
                <th className="border-y px-4 py-2 text-left">Specs</th>
                <th className="border-y px-4 py-2 text-center">Unit</th>
                <th className="border-y px-4 py-2 text-right">Quantity</th>
                <th className="border-y px-4 py-2 text-right">Unit Price</th>
                <th className="border-y border-r px-4 py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, index) => (
                <tr key={item.pr_detail_id} className="hover:bg-gray-50">
                  <td className="border-b border-l px-4 py-2">{item.item}</td>
                  <td className="border-b px-4 py-2 text-gray-600">{item.specs}</td>
                  <td className="border-b px-4 py-2 text-center">{item.unit}</td>
                  <td className="border-b px-4 py-2 text-right">
                    <input
                      type="number" min="0" value={item.quantity}
                      onChange={(e) => handleChange(index, "quantity", e.target.value)}
                      className="w-20 border rounded px-2 py-1 text-right"
                    />
                  </td>
                  <td className="border-b px-4 py-2 text-right">
                    <input
                      type="number" min="0" step="0.01" value={item.unit_price}
                      onChange={(e) => handleChange(index, "unit_price", e.target.value)}
                      className="w-24 border rounded px-2 py-1 text-right"
                    />
                     <div className={`text-xs mt-1 ${item.priceSource === 'Quoted Price' ? 'text-green-600' : 'text-gray-500'}`}>
                      {item.priceSource}
                    </div>
                  </td>
                  <td className="border-b border-r px-4 py-2 text-right font-medium">
                    ₱{Number(item.total_price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* The submit button now triggers the dialog */}
        <Button
          type="submit"
          disabled={processing || !selectedSupplierId}
          className="mt-6"
        >
          {processing ? "Submitting..." : "Submit Purchase Order"}
        </Button>
      </form>

      {/* 5. Add the Confirmation Dialog component */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="text-yellow-500" />
              Confirm Submission
            </DialogTitle>
            <DialogDescription className="pt-4 text-base">
              Are you sure you want to create this Purchase Order? Please review the items and prices before proceeding.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsConfirmDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmSubmit}
              disabled={processing}
              className="bg-green-600 hover:bg-green-700"
            >
              {processing ? "Submitting..." : "Confirm & Create PO"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isReasonDialogOpen} onOpenChange={setIsReasonDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reason for Change</DialogTitle>
            <DialogDescription className="pt-2">
              You changed the quantity from the original PR. Please provide a reason for this adjustment.
            </DialogDescription>
          </DialogHeader>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full border rounded px-3 py-2 mt-3"
            rows="3"
            placeholder="Enter reason..."
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsReasonDialogOpen(false);
                setPendingChange(null);
                setReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmReason}
              disabled={!reason.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Save Change
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </SupplyOfficerLayout>
  );
}