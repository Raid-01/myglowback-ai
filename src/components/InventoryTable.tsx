'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input, Label, Select } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn, formatNaira } from '@/lib/utils';
import { Trash2, Plus } from 'lucide-react';

const CONCERNS = [
  { value: 'ACNE', label: 'Acne' },
  { value: 'HYPERPIGMENTATION', label: 'Hyperpigmentation' },
  { value: 'SUN_DAMAGE', label: 'Sun Damage' },
  { value: 'AGING', label: 'Anti-Aging' },
] as const;

interface Product {
  id: string;
  name: string;
  brand: string | null;
  category: string;
  price: number | null;
  stockQuantity: number;
  activeIngredients: string[];
  concerns: string[];
  isUpsell: boolean;
}

export function InventoryTable({ initialProducts }: { initialProducts: Product[] }) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [showForm, setShowForm] = useState(false);
  const [concerns, setConcerns] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleConcern(value: string) {
    setConcerns((prev) => (prev.includes(value) ? prev.filter((c) => c !== value) : [...prev, value]));
  }

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (concerns.length === 0) {
      setError('Select at least one of the four core concerns.');
      return;
    }
    setSaving(true);
    setError(null);
    const form = new FormData(e.currentTarget);

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.get('name'),
          brand: form.get('brand') || undefined,
          category: form.get('category'),
          price: form.get('price') ? Number(form.get('price')) : undefined,
          stockQuantity: Number(form.get('stockQuantity') || 0),
          activeIngredients: String(form.get('activeIngredients') || '')
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
          concerns,
          isUpsell: form.get('isUpsell') === 'on',
        }),
      });

      setSaving(false);
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.error?.formErrors?.[0] ?? 'Could not add product.');
        return;
      }
      const created = await res.json();
      setProducts((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
      setShowForm(false);
      setConcerns([]);
      router.refresh();
    } catch {
      setSaving(false);
      setError('Could not reach the server. Check your connection and try again.');
    }
  }

  async function updateStock(id: string, stockQuantity: number) {
    const previous = products.find((p) => p.id === id)?.stockQuantity;
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, stockQuantity } : p)));
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stockQuantity }),
      });
      if (!res.ok) throw new Error('failed');
    } catch {
      // Revert the optimistic update — the server didn't actually save it.
      if (previous !== undefined) {
        setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, stockQuantity: previous } : p)));
      }
      setError('Could not update stock. Check your connection and try again.');
    }
  }

  async function handleDelete(id: string) {
    const removed = products.find((p) => p.id === id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('failed');
    } catch {
      // Put it back — the server didn't actually delete it.
      if (removed) setProducts((prev) => [...prev, removed].sort((a, b) => a.name.localeCompare(b.name)));
      setError('Could not delete product. Check your connection and try again.');
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-2xl font-medium text-clinical-text">Inventory</h1>
        <Button size="sm" onClick={() => setShowForm((v) => !v)}>
          <Plus size={16} /> Add Product
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="name">Product name</Label>
                <Input id="name" name="name" required />
              </div>
              <div>
                <Label htmlFor="brand">Brand</Label>
                <Input id="brand" name="brand" />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Input id="category" name="category" required placeholder="Cleanser, Serum, etc." />
              </div>
              <div>
                <Label htmlFor="price">Price (₦)</Label>
                <Input id="price" name="price" type="number" min={0} />
              </div>
              <div>
                <Label htmlFor="stockQuantity">Stock quantity</Label>
                <Input id="stockQuantity" name="stockQuantity" type="number" min={0} defaultValue={0} />
              </div>
              <div>
                <Label htmlFor="activeIngredients">Active ingredients (comma separated)</Label>
                <Input id="activeIngredients" name="activeIngredients" placeholder="Niacinamide, Zinc" />
              </div>
            </div>

            <div>
              <Label>Concerns</Label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {CONCERNS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => toggleConcern(c.value)}
                    className={cn(
                      'rounded-xl border px-3 py-2 text-sm font-medium transition-colors',
                      concerns.includes(c.value)
                        ? 'border-sage-500 bg-sage-50 text-sage-800'
                        : 'border-clinical-border bg-white text-clinical-text'
                    )}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-clinical-text">
              <input type="checkbox" name="isUpsell" className="rounded border-clinical-border" />
              Mark as upsell product
            </label>

            {error && <p className="text-sm text-danger">{error}</p>}

            <Button type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Add product'}
            </Button>
          </form>
        </Card>
      )}

      <Card>
        {products.length === 0 ? (
          <p className="text-sm text-clinical-muted">No products yet — add your first one above.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-clinical-border text-xs uppercase tracking-wide text-clinical-muted">
                <th className="pb-2">Product</th>
                <th className="pb-2">Concerns</th>
                <th className="pb-2">Price</th>
                <th className="pb-2">Stock</th>
                <th className="pb-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-clinical-border">
              {products.map((p) => (
                <tr key={p.id}>
                  <td className="py-3">
                    <p className="font-medium text-clinical-text">{p.name}</p>
                    <p className="text-xs text-clinical-muted">
                      {p.brand} {p.isUpsell && '· Upsell'}
                    </p>
                  </td>
                  <td className="py-3">
                    <div className="flex flex-wrap gap-1">
                      {p.concerns.map((c) => (
                        <Badge key={c} tone="sage">
                          {c.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 text-clinical-text">{p.price ? formatNaira(p.price) : '—'}</td>
                  <td className="py-3">
                    <input
                      type="number"
                      min={0}
                      value={p.stockQuantity}
                      onChange={(e) => updateStock(p.id, Number(e.target.value))}
                      className="w-20 rounded-lg border border-clinical-border px-2 py-1"
                    />
                  </td>
                  <td className="py-3 text-right">
                    <button onClick={() => handleDelete(p.id)} className="text-clinical-muted hover:text-danger">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
