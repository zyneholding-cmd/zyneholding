import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PRODUCT_COLORS } from "@/types/sales";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, Image as ImageIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { playSound } from "@/utils/sounds";
import { z } from "zod";

const productSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be under 100 characters"),
  costPrice: z.number().positive("Cost price must be positive").max(999_999_999, "Price too large"),
  image: z.string().url("Invalid image URL").optional().or(z.literal("")),
  stock: z.number().nonnegative("Stock cannot be negative"),
  minStock: z.number().nonnegative("Min stock cannot be negative").optional(),
  barcode: z.string().max(50, "Barcode too long").optional(),
});

interface AddProductModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    costPrice: number;
    color: string;
    image: string;
    stock?: number;
    category?: string;
    minStock?: number;
    barcode?: string;
  }) => void;
}

export const AddProductModal = ({ open, onClose, onSubmit }: AddProductModalProps) => {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [image, setImage] = useState("");
  const [selectedColor, setSelectedColor] = useState(PRODUCT_COLORS[0]);
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("electronics");
  const [minStock, setMinStock] = useState("5");
  const [barcode, setBarcode] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState("");

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    setUploadingImage(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from("product-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("product-images")
        .getPublicUrl(filePath);

      setImage(publicUrl);
      setImagePreview(publicUrl);
      toast.success("Image uploaded successfully!");
    } catch (error: any) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("You must be logged in to add products");
      return;
    }

    const parsed = productSchema.safeParse({
      name,
      costPrice: parseFloat(costPrice),
      image: image || imagePreview || "",
      stock: stock ? parseFloat(stock) : 0,
      minStock: minStock ? parseFloat(minStock) : 5,
      barcode: barcode || undefined,
    });

    if (!parsed.success) {
      const firstError = parsed.error.errors[0]?.message || "Invalid input";
      toast.error(firstError);
      return;
    }

    playSound('success');
    onSubmit({
      name: parsed.data.name,
      costPrice: parsed.data.costPrice,
      color: selectedColor,
      image: parsed.data.image || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
      stock: parsed.data.stock,
      category,
      minStock: parsed.data.minStock ?? 5,
      barcode: parsed.data.barcode,
    });

    setName("");
    setCostPrice("");
    setImage("");
    setSelectedColor(PRODUCT_COLORS[0]);
    setStock("");
    setCategory("electronics");
    setMinStock("5");
    setBarcode("");
    setImagePreview("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., iPhone 15"
              required
            />
          </div>

          <div>
            <Label htmlFor="costPrice">Cost Price (PKR) *</Label>
            <Input
              id="costPrice"
              type="number"
              value={costPrice}
              onChange={(e) => setCostPrice(e.target.value)}
              placeholder="250000"
              required
            />
          </div>

          <div>
            <Label>Product Image</Label>
            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    id="image"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="Or paste image URL"
                  />
                </div>
                <Label
                  htmlFor="file-upload"
                  className="cursor-pointer inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                >
                  {uploadingImage ? (
                    "Uploading..."
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </>
                  )}
                </Label>
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                />
              </div>
              {(imagePreview || image) && (
                <div className="relative w-full h-32 bg-muted rounded-lg overflow-hidden">
                  <img
                    src={imagePreview || image}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="stock">Stock/Inventory *</Label>
            <Input
              id="stock"
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              placeholder="100"
              required
            />
          </div>

          <div>
            <Label htmlFor="category">Category *</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="electronics">Electronics</SelectItem>
                <SelectItem value="food">Food & Edibles</SelectItem>
                <SelectItem value="clothing">Clothing</SelectItem>
                <SelectItem value="furniture">Furniture</SelectItem>
                <SelectItem value="cosmetics">Cosmetics</SelectItem>
                <SelectItem value="books">Books</SelectItem>
                <SelectItem value="toys">Toys</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="minStock">Min Stock Alert</Label>
              <Input
                id="minStock"
                type="number"
                value={minStock}
                onChange={(e) => setMinStock(e.target.value)}
                placeholder="5"
              />
            </div>
            <div>
              <Label htmlFor="barcode">Barcode/SKU</Label>
              <Input
                id="barcode"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="Optional"
              />
            </div>
          </div>

          <div>
            <Label>Color</Label>
            <div className="grid grid-cols-6 gap-2 mt-2">
              {PRODUCT_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`h-10 rounded-lg transition-all ${
                    selectedColor === color ? "ring-2 ring-offset-2 ring-primary" : ""
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setSelectedColor(color)}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Add Product</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
