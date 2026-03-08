import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, FileText, Send, Download, Trash2, Eye, Search, Filter, Receipt, DollarSign, Clock, CheckCircle } from "lucide-react";
import { format } from "date-fns";

interface InvoiceItem {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

interface Invoice {
  id: string;
  invoice_number: string;
  customer_id: string | null;
  customer_name: string;
  customer_email: string | null;
  customer_address: string | null;
  items: InvoiceItem[];
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount: number;
  total: number;
  amount_paid: number;
  balance_due: number;
  status: string;
  issue_date: string;
  due_date: string | null;
  notes: string | null;
  terms: string | null;
  created_at: string | null;
}

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  sent: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  paid: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  overdue: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  cancelled: "bg-muted text-muted-foreground line-through",
};

const Invoices = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [customers, setCustomers] = useState<{ id: string; name: string; email: string | null; address: string | null }[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_email: "",
    customer_address: "",
    customer_id: "",
    tax_rate: 0,
    discount: 0,
    notes: "",
    terms: "Payment due within 30 days of invoice date.",
    due_date: "",
  });
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: "", quantity: 1, unit_price: 0, total: 0 },
  ]);

  useEffect(() => {
    if (user) {
      fetchInvoices();
      fetchCustomers();
    }
  }, [user]);

  const fetchInvoices = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("invoices")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setInvoices(data.map((inv: any) => ({ ...inv, items: inv.items as InvoiceItem[] })));
    }
    setLoading(false);
  };

  const fetchCustomers = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("customers")
      .select("id, name, email, address")
      .eq("created_by", user.id);
    if (data) setCustomers(data);
  };

  const generateInvoiceNumber = () => {
    const prefix = "INV";
    const date = format(new Date(), "yyyyMMdd");
    const rand = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
    return `${prefix}-${date}-${rand}`;
  };

  const updateItemTotal = (index: number, field: string, value: number | string) => {
    const updated = [...items];
    (updated[index] as any)[field] = value;
    if (field === "quantity" || field === "unit_price") {
      updated[index].total = updated[index].quantity * updated[index].unit_price;
    }
    setItems(updated);
  };

  const addItem = () => {
    setItems([...items, { description: "", quantity: 1, unit_price: 0, total: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const taxAmount = subtotal * (formData.tax_rate / 100);
    const total = subtotal + taxAmount - formData.discount;
    return { subtotal, taxAmount, total };
  };

  const handleCustomerSelect = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      setFormData(prev => ({
        ...prev,
        customer_id: customer.id,
        customer_name: customer.name,
        customer_email: customer.email || "",
        customer_address: customer.address || "",
      }));
    }
  };

  const createInvoice = async () => {
    if (!user) return;
    if (!formData.customer_name.trim()) {
      toast.error("Customer name is required");
      return;
    }
    if (items.some(item => !item.description.trim())) {
      toast.error("All items need a description");
      return;
    }

    const { subtotal, taxAmount, total } = calculateTotals();
    const invoiceNumber = generateInvoiceNumber();

    const { error } = await supabase.from("invoices").insert({
      invoice_number: invoiceNumber,
      customer_name: formData.customer_name,
      customer_email: formData.customer_email || null,
      customer_address: formData.customer_address || null,
      customer_id: formData.customer_id || null,
      items: items as any,
      subtotal,
      tax_rate: formData.tax_rate,
      tax_amount: taxAmount,
      discount: formData.discount,
      total,
      amount_paid: 0,
      balance_due: total,
      status: "draft",
      issue_date: new Date().toISOString().split("T")[0],
      due_date: formData.due_date || null,
      notes: formData.notes || null,
      terms: formData.terms || null,
      user_id: user.id,
    });

    if (error) {
      toast.error("Failed to create invoice");
      return;
    }

    toast.success(`Invoice ${invoiceNumber} created`);
    setShowCreate(false);
    resetForm();
    fetchInvoices();
  };

  const resetForm = () => {
    setFormData({
      customer_name: "", customer_email: "", customer_address: "",
      customer_id: "", tax_rate: 0, discount: 0, notes: "",
      terms: "Payment due within 30 days of invoice date.", due_date: "",
    });
    setItems([{ description: "", quantity: 1, unit_price: 0, total: 0 }]);
  };

  const updateInvoiceStatus = async (id: string, status: string) => {
    const updateData: any = { status };
    if (status === "paid") {
      const invoice = invoices.find(inv => inv.id === id);
      if (invoice) {
        updateData.amount_paid = invoice.total;
        updateData.balance_due = 0;
      }
    }
    const { error } = await supabase.from("invoices").update(updateData).eq("id", id);
    if (!error) {
      toast.success(`Invoice marked as ${status}`);
      fetchInvoices();
    }
  };

  const deleteInvoice = async (id: string) => {
    const { error } = await supabase.from("invoices").delete().eq("id", id);
    if (!error) {
      toast.success("Invoice deleted");
      setSelectedInvoice(null);
      fetchInvoices();
    }
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.invoice_number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "all" || inv.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: invoices.length,
    totalAmount: invoices.reduce((s, i) => s + i.total, 0),
    paid: invoices.filter(i => i.status === "paid").reduce((s, i) => s + i.total, 0),
    outstanding: invoices.filter(i => i.status !== "paid" && i.status !== "cancelled").reduce((s, i) => s + i.balance_due, 0),
    overdue: invoices.filter(i => i.status === "overdue").length,
  };

  const { subtotal, taxAmount, total } = calculateTotals();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Invoicing</h1>
          <p className="text-muted-foreground text-sm">Create and manage invoices</p>
        </div>
        <Dialog open={showCreate} onOpenChange={(open) => { setShowCreate(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />New Invoice</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Invoice</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              {/* Customer */}
              <div className="space-y-3">
                <h3 className="font-medium text-sm text-foreground">Customer Details</h3>
                {customers.length > 0 && (
                  <div>
                    <Label className="text-xs">Select Existing Customer</Label>
                    <Select onValueChange={handleCustomerSelect}>
                      <SelectTrigger><SelectValue placeholder="Choose customer..." /></SelectTrigger>
                      <SelectContent>
                        {customers.map(c => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Name *</Label>
                    <Input value={formData.customer_name} onChange={e => setFormData(p => ({ ...p, customer_name: e.target.value }))} />
                  </div>
                  <div>
                    <Label className="text-xs">Email</Label>
                    <Input value={formData.customer_email} onChange={e => setFormData(p => ({ ...p, customer_email: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Address</Label>
                  <Input value={formData.customer_address} onChange={e => setFormData(p => ({ ...p, customer_address: e.target.value }))} />
                </div>
              </div>

              {/* Items */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-sm text-foreground">Line Items</h3>
                  <Button size="sm" variant="outline" onClick={addItem}>
                    <Plus className="h-3 w-3 mr-1" />Add Item
                  </Button>
                </div>
                {items.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-5">
                      {idx === 0 && <Label className="text-xs">Description</Label>}
                      <Input value={item.description} onChange={e => updateItemTotal(idx, "description", e.target.value)} placeholder="Item description" />
                    </div>
                    <div className="col-span-2">
                      {idx === 0 && <Label className="text-xs">Qty</Label>}
                      <Input type="number" value={item.quantity} onChange={e => updateItemTotal(idx, "quantity", Number(e.target.value))} min={1} />
                    </div>
                    <div className="col-span-2">
                      {idx === 0 && <Label className="text-xs">Price</Label>}
                      <Input type="number" value={item.unit_price} onChange={e => updateItemTotal(idx, "unit_price", Number(e.target.value))} min={0} />
                    </div>
                    <div className="col-span-2">
                      {idx === 0 && <Label className="text-xs">Total</Label>}
                      <Input value={`PKR ${item.total.toLocaleString()}`} readOnly className="bg-muted" />
                    </div>
                    <div className="col-span-1">
                      <Button size="icon" variant="ghost" onClick={() => removeItem(idx)} disabled={items.length === 1}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals & Settings */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs">Due Date</Label>
                    <Input type="date" value={formData.due_date} onChange={e => setFormData(p => ({ ...p, due_date: e.target.value }))} />
                  </div>
                  <div>
                    <Label className="text-xs">Notes</Label>
                    <Textarea value={formData.notes} onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))} rows={2} />
                  </div>
                  <div>
                    <Label className="text-xs">Terms</Label>
                    <Textarea value={formData.terms} onChange={e => setFormData(p => ({ ...p, terms: e.target.value }))} rows={2} />
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs">Tax Rate (%)</Label>
                    <Input type="number" value={formData.tax_rate} onChange={e => setFormData(p => ({ ...p, tax_rate: Number(e.target.value) }))} min={0} max={100} />
                  </div>
                  <div>
                    <Label className="text-xs">Discount (PKR)</Label>
                    <Input type="number" value={formData.discount} onChange={e => setFormData(p => ({ ...p, discount: Number(e.target.value) }))} min={0} />
                  </div>
                  <Card className="bg-muted/50">
                    <CardContent className="p-4 space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>PKR {subtotal.toLocaleString()}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Tax ({formData.tax_rate}%)</span><span>PKR {taxAmount.toLocaleString()}</span></div>
                      {formData.discount > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Discount</span><span>-PKR {formData.discount.toLocaleString()}</span></div>}
                      <div className="flex justify-between font-bold border-t pt-2"><span>Total</span><span>PKR {total.toLocaleString()}</span></div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <Button onClick={createInvoice} className="w-full">
                <FileText className="h-4 w-4 mr-2" />Create Invoice
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10"><Receipt className="h-5 w-5 text-primary" /></div>
          <div><p className="text-xs text-muted-foreground">Total Invoices</p><p className="text-xl font-bold">{stats.total}</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10"><DollarSign className="h-5 w-5 text-primary" /></div>
          <div><p className="text-xs text-muted-foreground">Total Amount</p><p className="text-xl font-bold">PKR {stats.totalAmount.toLocaleString()}</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30"><CheckCircle className="h-5 w-5 text-green-600" /></div>
          <div><p className="text-xs text-muted-foreground">Paid</p><p className="text-xl font-bold">PKR {stats.paid.toLocaleString()}</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30"><Clock className="h-5 w-5 text-orange-600" /></div>
          <div><p className="text-xs text-muted-foreground">Outstanding</p><p className="text-xl font-bold">PKR {stats.outstanding.toLocaleString()}</p></div>
        </CardContent></Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search invoices..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40"><Filter className="h-4 w-4 mr-2" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Invoice Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
              ) : filteredInvoices.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  {invoices.length === 0 ? "No invoices yet. Create your first invoice!" : "No invoices match your filters."}
                </TableCell></TableRow>
              ) : filteredInvoices.map(inv => (
                <TableRow key={inv.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedInvoice(inv)}>
                  <TableCell className="font-mono text-sm">{inv.invoice_number}</TableCell>
                  <TableCell className="font-medium">{inv.customer_name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{format(new Date(inv.issue_date), "MMM d, yyyy")}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{inv.due_date ? format(new Date(inv.due_date), "MMM d, yyyy") : "—"}</TableCell>
                  <TableCell className="text-right font-medium">PKR {inv.total.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-medium">{inv.balance_due > 0 ? `PKR ${inv.balance_due.toLocaleString()}` : "—"}</TableCell>
                  <TableCell><Badge className={statusColors[inv.status] || ""}>{inv.status}</Badge></TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                      {inv.status === "draft" && (
                        <Button size="sm" variant="ghost" onClick={() => updateInvoiceStatus(inv.id, "sent")} title="Mark as Sent">
                          <Send className="h-4 w-4" />
                        </Button>
                      )}
                      {(inv.status === "sent" || inv.status === "overdue") && (
                        <Button size="sm" variant="ghost" onClick={() => updateInvoiceStatus(inv.id, "paid")} title="Mark as Paid">
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => deleteInvoice(inv.id)} title="Delete">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Invoice Detail Dialog */}
      <Dialog open={!!selectedInvoice} onOpenChange={(open) => { if (!open) setSelectedInvoice(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {selectedInvoice?.invoice_number}
            </DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-4 text-sm">
              <div className="flex justify-between">
                <div>
                  <p className="font-medium">{selectedInvoice.customer_name}</p>
                  {selectedInvoice.customer_email && <p className="text-muted-foreground">{selectedInvoice.customer_email}</p>}
                  {selectedInvoice.customer_address && <p className="text-muted-foreground">{selectedInvoice.customer_address}</p>}
                </div>
                <Badge className={statusColors[selectedInvoice.status]}>{selectedInvoice.status}</Badge>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead className="text-center">Qty</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(selectedInvoice.items as InvoiceItem[]).map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell className="text-center">{item.quantity}</TableCell>
                        <TableCell className="text-right">PKR {item.unit_price.toLocaleString()}</TableCell>
                        <TableCell className="text-right">PKR {item.total.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="space-y-1 text-right">
                <p>Subtotal: <span className="font-medium">PKR {selectedInvoice.subtotal.toLocaleString()}</span></p>
                {selectedInvoice.tax_amount > 0 && <p>Tax ({selectedInvoice.tax_rate}%): <span className="font-medium">PKR {selectedInvoice.tax_amount.toLocaleString()}</span></p>}
                {selectedInvoice.discount > 0 && <p>Discount: <span className="font-medium">-PKR {selectedInvoice.discount.toLocaleString()}</span></p>}
                <p className="text-lg font-bold border-t pt-1">Total: PKR {selectedInvoice.total.toLocaleString()}</p>
                {selectedInvoice.balance_due > 0 && <p className="text-destructive">Balance Due: PKR {selectedInvoice.balance_due.toLocaleString()}</p>}
              </div>

              {selectedInvoice.notes && <div><p className="font-medium">Notes</p><p className="text-muted-foreground">{selectedInvoice.notes}</p></div>}
              {selectedInvoice.terms && <div><p className="font-medium">Terms</p><p className="text-muted-foreground">{selectedInvoice.terms}</p></div>}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Invoices;
