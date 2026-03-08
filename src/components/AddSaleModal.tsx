import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PAYMENT_METHODS, Product } from "@/types/sales";
import { toast } from "sonner";
import { z } from "zod";

const saleSchema = z.object({
  customer: z.string().trim().min(1, "Customer name is required").max(100, "Customer name too long"),
  contact: z.string().max(50, "Contact too long").optional().or(z.literal("")),
  address: z.string().max(300, "Address too long").optional().or(z.literal("")),
  quantity: z.number().positive("Quantity must be positive").int("Quantity must be a whole number"),
  salePrice: z.number().positive("Sale price must be positive").max(999_999_999, "Price too large"),
  notes: z.string().max(1000, "Notes too long").optional().or(z.literal("")),
});

interface AddSaleModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  product: Product | null;
}

export const AddSaleModal = ({ open, onClose, onSubmit, product }: AddSaleModalProps) => {
  const [customer, setCustomer] = useState("");
  const [contact, setContact] = useState("");
  const [address, setAddress] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [salePrice, setSalePrice] = useState("");
  const [paymentType, setPaymentType] = useState<"full" | "partial">("full");
  const [paid, setPaid] = useState("");
  const [method, setMethod] = useState<typeof PAYMENT_METHODS[number]>("COD");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");

  const total = parseFloat(salePrice || "0") * parseFloat(quantity || "1");
  const paidAmount = paymentType === "full" ? total : parseFloat(paid || "0");
  const remaining = total - paidAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer || !salePrice || !product) return;

    const profit = (parseFloat(salePrice) - product.costPrice) * parseFloat(quantity);

    onSubmit({
      customer,
      contact,
      address,
      quantity: parseFloat(quantity),
      salePrice: parseFloat(salePrice),
      total,
      paid: paidAmount,
      remaining,
      paymentType,
      method,
      date: new Date().toISOString(),
      dueDate: dueDate || undefined,
      status: remaining === 0 ? "Paid" : remaining === total ? "Pending" : "Partial",
      profit,
      notes,
    });

    resetForm();
    onClose();
  };

  const resetForm = () => {
    setCustomer("");
    setContact("");
    setAddress("");
    setQuantity("1");
    setSalePrice("");
    setPaymentType("full");
    setPaid("");
    setMethod("COD");
    setDueDate("");
    setNotes("");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Sale for {product?.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customer">Customer Name *</Label>
              <Input
                id="customer"
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="contact">Contact</Label>
              <Input
                id="contact"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="salePrice">Sale Price (PKR) *</Label>
              <Input
                id="salePrice"
                type="number"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium">Total: PKR {total.toLocaleString()}</p>
            {product && (
              <p className="text-sm text-muted-foreground">
                Expected Profit: PKR {((parseFloat(salePrice || "0") - product.costPrice) * parseFloat(quantity)).toLocaleString()}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="method">Payment Method</Label>
              <Select value={method} onValueChange={(val: any) => setMethod(val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="paymentType">Payment Type</Label>
              <Select value={paymentType} onValueChange={(val: any) => setPaymentType(val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Pay in Full</SelectItem>
                  <SelectItem value="partial">Pay Partial</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {paymentType === "partial" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="paid">Amount Paid (PKR) *</Label>
                <Input
                  id="paid"
                  type="number"
                  value={paid}
                  onChange={(e) => setPaid(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>
          )}

          {paymentType === "partial" && (
            <div className="p-3 bg-warning/10 rounded-lg border border-warning">
              <p className="text-sm font-medium text-warning">
                Remaining: PKR {remaining.toLocaleString()}
              </p>
            </div>
          )}

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Add Sale</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
