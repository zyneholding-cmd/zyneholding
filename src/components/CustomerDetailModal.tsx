import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sale, PAYMENT_METHODS } from "@/types/sales";
import { Line } from "react-chartjs-2";

interface CustomerDetailModalProps {
  open: boolean;
  onClose: () => void;
  sale: Sale | null;
  onUpdate: (updates: Partial<Sale>) => void;
}

export const CustomerDetailModal = ({ open, onClose, sale, onUpdate }: CustomerDetailModalProps) => {
  const [formData, setFormData] = useState<Partial<Sale>>({});

  useEffect(() => {
    if (sale) {
      setFormData(sale);
    }
  }, [sale]);

  if (!sale) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const total = (formData.salePrice || 0) * (formData.quantity || 1);
    const paid = formData.paid || 0;
    const remaining = total - paid;
    const status = remaining === 0 ? "Paid" : remaining === total ? "Pending" : "Partial";

    onUpdate({
      ...formData,
      total,
      remaining,
      status,
    });
    onClose();
  };

  const data = {
    labels: ["Start", "Current"],
    datasets: [
      {
        label: "Amount Paid (PKR)",
        data: [0, sale.paid],
        borderColor: "#007AFF",
        backgroundColor: "#007AFF33",
        fill: true,
        tension: 0.4,
      },
      {
        label: "Amount Remaining (PKR)",
        data: [sale.total, sale.remaining],
        borderColor: "#FF9500",
        backgroundColor: "#FF950033",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: any) => `PKR ${value.toLocaleString()}`,
        },
      },
    },
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Customer Details: {sale.customer}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Chart */}
          <div className="bg-muted/30 rounded-lg p-4">
            <h3 className="font-semibold mb-4">Payment Progress</h3>
            <div className="h-[200px]">
              <Line data={data} options={options} />
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-card border rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground">Total Sale</p>
              <p className="text-xl font-bold">PKR {sale.total.toLocaleString()}</p>
            </div>
            <div className="bg-success/5 border border-success/20 rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground">Paid</p>
              <p className="text-xl font-bold text-success">PKR {sale.paid.toLocaleString()}</p>
            </div>
            <div className="bg-warning/5 border border-warning/20 rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground">Remaining</p>
              <p className="text-xl font-bold text-warning">PKR {sale.remaining.toLocaleString()}</p>
            </div>
          </div>

          {/* Edit Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-customer">Customer Name</Label>
                <Input
                  id="edit-customer"
                  value={formData.customer || ""}
                  onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-contact">Contact</Label>
                <Input
                  id="edit-contact"
                  value={formData.contact || ""}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit-address">Address</Label>
              <Input
                id="edit-address"
                value={formData.address || ""}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-quantity">Quantity</Label>
                <Input
                  id="edit-quantity"
                  type="number"
                  value={formData.quantity || 1}
                  onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="edit-salePrice">Sale Price (PKR)</Label>
                <Input
                  id="edit-salePrice"
                  type="number"
                  value={formData.salePrice || 0}
                  onChange={(e) => setFormData({ ...formData, salePrice: parseFloat(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-paid">Amount Paid (PKR)</Label>
                <Input
                  id="edit-paid"
                  type="number"
                  value={formData.paid || 0}
                  onChange={(e) => setFormData({ ...formData, paid: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="edit-method">Payment Method</Label>
                <Select
                  value={formData.method}
                  onValueChange={(val: any) => setFormData({ ...formData, method: val })}
                >
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
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
