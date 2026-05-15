'use client';

import { useState } from 'react';
import { formatCurrency } from '@/utils/formatCurrency';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Wallet, Search, CheckCircle } from 'lucide-react';

const METHODS = ['Bank', 'UPI', 'Cash'];

export function MakePayoutSection({ balances, onCreate, isCreating }) {
  const plumberBalances = balances || [];
  const [selectedPlumber, setSelectedPlumber] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [form, setForm] = useState({
    amount: '',
    method: 'Bank',
    reference_number: '',
    note: '',
  });

  const filteredBalances = plumberBalances.filter(
    (b) =>
      b.plumber?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.plumber?.phone?.includes(searchQuery)
  );

  const handleSelectPlumber = (balance) => {
    setSelectedPlumber(balance.plumber);
    setForm({ amount: '', method: 'Bank', reference_number: '', note: '' });
  };

  const handleFillFull = () => {
    if (selectedPlumber) {
      const balance = plumberBalances.find((b) => b.plumber._id === selectedPlumber._id);
      setForm({ ...form, amount: (balance?.total_eligible_balance || 0).toString() });
    }
  };

  const handlePayFull = () => {
    handleFillFull();
    handleSubmit();
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!selectedPlumber || !form.amount) return;

    await onCreate(selectedPlumber._id, {
      amount: parseFloat(form.amount),
      method: form.method,
      reference_number: form.reference_number,
      note: form.note,
    });

    setSelectedPlumber(null);
    setForm({ amount: '', method: 'Bank', reference_number: '', note: '' });
  };

  const needsReference = form.method === 'Bank' || form.method === 'UPI';
  const balance = selectedPlumber
    ? plumberBalances.find((b) => b.plumber._id === selectedPlumber._id)?.total_eligible_balance || 0
    : 0;
  const isValid =
    selectedPlumber &&
    parseFloat(form.amount) > 0 &&
    parseFloat(form.amount) <= balance &&
    (!needsReference || form.reference_number.trim() !== '');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Plumber List */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Search size={16} className="text-[var(--color-body-light)]" />
            <Input
              placeholder="Search plumber..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9"
            />
          </div>

          {filteredBalances.length === 0 ? (
            <div className="text-center py-8 text-[var(--color-body-light)]">
              <p className="text-sm">No plumbers with pending balance</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {filteredBalances.map((item) => (
                <button
                  key={item.plumber._id}
                  onClick={() => handleSelectPlumber(item)}
                  className={`w-full p-3 rounded-lg border text-left transition-all ${
                    selectedPlumber?._id === item.plumber._id
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
                      : 'border-[var(--color-border)] hover:border-[var(--color-primary)]/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-[var(--color-navy)]">{item.plumber.full_name}</p>
                      <p className="text-xs text-[var(--color-body-light)]">{item.plumber.phone}</p>
                    </div>
                    <p className="font-semibold text-[var(--color-success)]">{formatCurrency(item.total_eligible_balance)}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payout Form */}
      <Card>
        <CardContent className="p-4">
          {selectedPlumber ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-[var(--color-navy)]">Payout to {selectedPlumber.full_name}</h3>
                <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedPlumber(null)}>
                  Change
                </Button>
              </div>

              <div className="p-4 bg-[var(--color-success)]/5 rounded-xl border border-[var(--color-success)]/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-[var(--color-body)] font-medium">Available Balance</p>
                    <p className="text-2xl font-bold text-[var(--color-success)]">{formatCurrency(balance)}</p>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={handlePayFull}>
                    Pay Full
                  </Button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="amount">Amount (Rs.)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={balance}
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  placeholder="0.00"
                  required
                  className="text-base font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <Label>Payment Method</Label>
                <div className="grid grid-cols-3 gap-2">
                  {METHODS.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setForm({ ...form, method: m })}
                      className={`py-2 rounded-lg text-sm font-medium border transition-all ${
                        form.method === m
                          ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                          : 'bg-white text-[var(--color-body)] border-[var(--color-border)] hover:border-[var(--color-primary)]/30'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {needsReference && (
                <div className="space-y-1.5">
                  <Label htmlFor="reference">Reference Number</Label>
                  <Input
                    id="reference"
                    value={form.reference_number}
                    onChange={(e) => setForm({ ...form, reference_number: e.target.value })}
                    placeholder="Transaction ID"
                    required
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="note">Note (Optional)</Label>
                <Input
                  id="note"
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  placeholder="Add note..."
                />
              </div>

              <Button type="submit" disabled={!isValid || isCreating} className="w-full">
                {isCreating ? 'Creating...' : 'Create Payout'}
              </Button>
            </form>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[var(--color-bg-subtle)] flex items-center justify-center mb-4">
                <Wallet size={28} className="text-[var(--color-body-light)]" />
              </div>
              <h3 className="font-semibold text-[var(--color-navy)] mb-2">Select a Plumber</h3>
              <p className="text-sm text-[var(--color-body-light)]">
                Choose a plumber from the list to create a payout
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}