import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PRODUCT_COLORS } from "@/types/sales";

interface AddProductModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    costPrice: number;
    color: string;
    image: string;
  }) => void;
}

export const AddProductModal = ({ open, onClose, onSubmit }: AddProductModalProps) => {
  const [name, setName] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [image, setImage] = useState("");
  const [selectedColor, setSelectedColor] = useState(PRODUCT_COLORS[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !costPrice) return;

    onSubmit({
      name,
      costPrice: parseFloat(costPrice),
      color: selectedColor,
      image: image || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
    });

    setName("");
    setCostPrice("");
    setImage("");
    setSelectedColor(PRODUCT_COLORS[0]);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
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
            <Label htmlFor="image">Image URL</Label>
            <Input
              id="image"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
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
