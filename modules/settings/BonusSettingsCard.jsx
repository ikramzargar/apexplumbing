'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateSettings } from '@/lib/settings.api';
import { showSuccess, showApiError } from '@/utils/toast';
import { Calculator, DollarSign, Percent } from 'lucide-react';

export function BonusSettingsCard({ form, setForm }) {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const settingsData = {
      bonus_mode: form.bonus_mode,
      fixed_amount: form.bonus_mode === 'FIXED' ? parseFloat(form.fixed_amount) : undefined,
      percentage_value: form.bonus_mode === 'PERCENTAGE' ? parseFloat(form.percentage_value) : undefined,
    };

    try {
      await updateSettings(settingsData);
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      showSuccess('Settings updated successfully');
    } catch (error) {
      showApiError(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border-slate-200/60">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[var(--color-primary)]/10">
            <Calculator className="w-5 h-5 text-[var(--color-primary)]" />
          </div>
          <div>
            <CardTitle className="text-base">Bonus Configuration</CardTitle>
            <CardDescription className="text-xs mt-0.5">
              Set how plumber bonuses are calculated per invoice.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">Calculation Mode</Label>
            <Select
              value={form.bonus_mode}
              onValueChange={(val) => setForm({ ...form, bonus_mode: val })}
            >
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FIXED">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-slate-500" />
                    <div className="text-left">
                      <p className="font-medium text-sm">Fixed Amount</p>
                      <p className="text-xs text-muted-foreground">Same bonus for every invoice</p>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="PERCENTAGE">
                  <div className="flex items-center gap-2">
                    <Percent className="w-4 h-4 text-slate-500" />
                    <div className="text-left">
                      <p className="font-medium text-sm">Percentage</p>
                      <p className="text-xs text-muted-foreground">Percentage of invoice total</p>
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {form.bonus_mode === 'FIXED' && (
            <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl border border-slate-200/50">
              <div className="space-y-3">
                <Label htmlFor="fixed_amount" className="text-sm font-medium text-slate-700">
                  Fixed Bonus Amount
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">₹</span>
                  <Input
                    id="fixed_amount"
                    name="fixed_amount"
                    type="number"
                    value={form.fixed_amount}
                    onChange={(e) => setForm({ ...form, [e.target.name]: e.target.value })}
                    placeholder="50"
                    className="pl-8 h-11 font-medium"
                  />
                </div>
                <p className="text-xs text-slate-500">
                  Every verified plumber receives this amount per confirmed invoice.
                </p>
              </div>
            </div>
          )}

          {form.bonus_mode === 'PERCENTAGE' && (
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl border border-slate-200/50">
                <div className="space-y-3">
                  <Label htmlFor="percentage_value" className="text-sm font-medium text-slate-700">
                    Bonus Percentage
                  </Label>
                  <div className="relative">
                    <Input
                      id="percentage_value"
                      name="percentage_value"
                      type="number"
                      step="0.1"
                      value={form.percentage_value}
                      onChange={(e) => setForm({ ...form, [e.target.name]: e.target.value })}
                      placeholder="5"
                      className="pr-10 h-11 font-medium"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">%</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Plumber earns this percentage of the invoice total.
                  </p>
                </div>
              </div>

              {form.percentage_value && (
                <div className="p-4 bg-blue-50/70 rounded-xl border border-blue-100">
                  <p className="text-sm text-slate-600">
                    <span className="font-medium">Preview:</span> On a ₹1,000 invoice with {form.percentage_value}% bonus
                  </p>
                  <p className="text-lg font-semibold text-blue-600 mt-1">
                    Plumber earns: ₹{(1000 * parseFloat(form.percentage_value) / 100).toFixed(2)}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="pt-3 border-t border-slate-100">
            <Button type="submit" disabled={saving} className="w-full sm:w-auto">
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}