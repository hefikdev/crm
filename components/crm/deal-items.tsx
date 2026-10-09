"use client";

import { trpc } from "@/lib/trpc/client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Trash2, Loader2, Package } from "lucide-react";

export function DealItems({ dealId }: { dealId: string }) {
  const { data: items, isLoading, refetch } = trpc.deals.listItems.useQuery({ dealId });
  const { data: products } = trpc.products.list.useQuery({ limit: 100 });

  const [productId, setProductId] = useState("");
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);

  const addItem = trpc.deals.addItem.useMutation({
    onSuccess: () => {
      toast.success("Pozycja dodana");
      setName("");
      setQuantity(1);
      setUnitPrice(0);
      setProductId("");
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const removeItem = trpc.deals.removeItem.useMutation({
    onSuccess: () => {
      toast.success("Pozycja usunięta");
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const handleProductSelect = (id: string) => {
    setProductId(id);
    const product = products?.data.find((p) => p.id === id);
    if (product) {
      setName(product.name);
      setUnitPrice(product.price);
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Nazwa jest wymagana");
      return;
    }
    addItem.mutate({
      dealId,
      data: { productId, name, quantity, unitPrice },
    });
  };

  const total = items?.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0) ?? 0;

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Pozycje oferty
          </CardTitle>
          <span className="text-sm font-medium text-foreground tabular-nums">
            {total.toLocaleString()} PLN
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <Skeleton className="h-20 bg-accent" />
        ) : items && items.length > 0 ? (
          <div className="divide-y divide-border">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3 min-w-0">
                  <Package className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-foreground truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.quantity} × {item.unitPrice.toLocaleString()} PLN
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm text-foreground tabular-nums">
                    {(item.quantity * item.unitPrice).toLocaleString()} PLN
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem.mutate({ id: item.id, dealId })}
                    className="text-muted-foreground hover:text-red-500 cursor-pointer"
                    aria-label="Usuń pozycję"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            Brak pozycji — dodaj produkty do oferty
          </p>
        )}

        <form onSubmit={handleAdd} className="space-y-3 pt-2 border-t border-border">
          <div className="space-y-2">
            <Label className="text-foreground">Produkt z katalogu</Label>
            <Select value={productId} onValueChange={(v) => handleProductSelect(v ?? "")}>
              <SelectTrigger className="bg-background text-foreground">
                <SelectValue placeholder="Wybierz produkt (opcjonalnie)" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border text-popover-foreground">
                {products?.data.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} — {p.price.toLocaleString()} PLN
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2 col-span-1">
              <Label className="text-foreground">Nazwa</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-9"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Ilość</Label>
              <Input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="h-9"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Cena</Label>
              <Input
                type="number"
                min={0}
                value={unitPrice}
                onChange={(e) => setUnitPrice(Number(e.target.value))}
                className="h-9"
              />
            </div>
          </div>
          <Button
            type="submit"
            variant="outline"
            className="w-full cursor-pointer"
            disabled={addItem.isPending}
          >
            {addItem.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Dodaj pozycję
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
