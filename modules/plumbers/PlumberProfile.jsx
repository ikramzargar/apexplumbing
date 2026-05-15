'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency } from '@/utils/formatCurrency';
import { useAuth } from '@/hooks/useAuth';
import { CheckCircle, XCircle, Mail, Phone, MapPin, Building2, Image as ImageIcon, X, Eye } from 'lucide-react';
import { BonusHistory } from './BonusHistory';
import { PayoutHistory } from './PayoutHistory';
import { VerifyPlumberDialog } from './VerifyPlumberDialog';
import { verifyPlumber } from '@/lib/plumbers.api';
import { useQueryClient } from '@tanstack/react-query';
import { showSuccess, showApiError } from '@/utils/toast';

function ImageModal({ src, alt, onClose }) {
  if (!src) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={onClose}>
      <button
        className="absolute top-4 right-4 p-2 bg-white/10 rounded-full hover:bg-white/20"
        onClick={onClose}
      >
        <X size={20} className="text-white" />
      </button>
      <img
        src={src}
        alt={alt}
        className="max-w-full max-h-[90vh] object-contain rounded-lg"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

export function PlumberProfile({ plumber }) {
  const { isAdmin, isStaff } = useAuth();
  const canVerify = isAdmin || isStaff;
  const queryClient = useQueryClient();
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImages, setShowImages] = useState(false);

  const handleVerify = async (status) => {
    try {
      await verifyPlumber(plumber._id, status);
      queryClient.invalidateQueries({ queryKey: ['plumbers'] });
      queryClient.invalidateQueries({ queryKey: ['plumber', plumber._id] });
      setVerifyOpen(false);
      showSuccess(status === 'VERIFIED' ? 'Plumber verified successfully' : 'Plumber rejected');
    } catch (err) {
      showApiError(err);
    }
  };

  if (!plumber) return null;

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            {/* Avatar */}
            {plumber.photo_url ? (
              <div
                className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 border-[var(--color-border)] cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setSelectedImage(plumber.photo_url)}
              >
                <img src={plumber.photo_url} alt={plumber.full_name} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-hover)] flex items-center justify-center flex-shrink-0">
                <span className="text-2xl font-semibold text-white">
                  {plumber.full_name?.charAt(0)?.toUpperCase()}
                </span>
              </div>
            )}

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-xl font-semibold text-[var(--color-text-secondary)]">{plumber.full_name}</h2>
                <StatusBadge status={plumber.verification_status} />
              </div>

              <div className="flex flex-wrap gap-4 text-xs text-[var(--color-text-muted)]">
                <div className="flex items-center gap-1.5">
                  <Phone size={13} />
                  <span>{plumber.phone}</span>
                </div>
                {plumber.alt_phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone size={13} />
                    <span>{plumber.alt_phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <MapPin size={13} />
                  <span>{plumber.district}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 p-3 md:p-4 bg-[var(--color-surface-elevated)] rounded-xl border border-[var(--color-border)]">
            <div>
              <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wide mb-1">Referrals</p>
              <p className="text-xl font-semibold text-[var(--color-text-secondary)]">{plumber.total_referrals || 0}</p>
            </div>
            <div>
              <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wide mb-1">Bonus Earned</p>
              <p className="text-xl font-semibold text-[var(--color-success)]">{formatCurrency(plumber.total_bonus_earned)}</p>
            </div>
            <div>
              <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wide mb-1">Total Paid</p>
              <p className="text-xl font-semibold text-[var(--color-primary)]">{formatCurrency(plumber.total_paid)}</p>
            </div>
            <div>
              <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wide mb-1">Balance</p>
              <p className="text-xl font-semibold text-[var(--color-warning)]">{formatCurrency(plumber.balance_due)}</p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide pb-2 border-b border-[var(--color-border)]">Personal Details</h3>
              <div className="space-y-2">
                {plumber.referral_code && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--color-text-muted)]">Referral Code</span>
                    <span className="font-medium text-[var(--color-primary)] font-mono">{plumber.referral_code}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--color-text-muted)]">District</span>
                  <span className="font-medium text-[var(--color-text-secondary)]">{plumber.district}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--color-text-muted)]">State</span>
                  <span className="font-medium text-[var(--color-text-secondary)]">{plumber.state}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--color-text-muted)]">Aadhaar</span>
                  <span className="font-medium text-[var(--color-text-secondary)]">****{plumber.aadhaar_number?.slice(-4)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--color-text-muted)]">Address</span>
                  <span className="font-medium text-[var(--color-text-secondary)] text-right max-w-[180px]">{plumber.address}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide pb-2 border-b border-[var(--color-border)]">Bank Details</h3>
              {plumber.bank_account ? (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--color-text-muted)]">Bank</span>
                    <span className="font-medium text-[var(--color-text-secondary)]">{plumber.bank_name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--color-text-muted)]">Account</span>
                    <span className="font-medium text-[var(--color-text-secondary)]">****{plumber.bank_account?.slice(-4)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--color-text-muted)]">IFSC</span>
                    <span className="font-medium text-[var(--color-text-secondary)]">{plumber.ifsc || 'N/A'}</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-[var(--color-text-muted)] italic">No bank details provided</p>
              )}
            </div>
          </div>

          {/* Actions */}
          {canVerify && plumber.verification_status === 'PENDING' && (
            <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t border-[var(--color-border)]">
              <Button className="bg-[var(--color-success)] hover:bg-[var(--color-success)] w-full sm:w-auto" onClick={() => setVerifyOpen(true)}>
                <CheckCircle size={15} className="mr-1.5" />Verify Plumber
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <VerifyPlumberDialog
        open={verifyOpen}
        plumber={plumber}
        onConfirm={handleVerify}
        onCancel={() => setVerifyOpen(false)}
      />

      {/* Images Button */}
      {(plumber.photo_url || plumber.aadhaar_front_url || plumber.aadhaar_back_url) && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ImageIcon size={16} className="text-[var(--color-text-muted)]" />
                <span className="text-sm text-[var(--color-text-muted)]">
                  {[
                    plumber.photo_url && 'Profile Photo',
                    plumber.aadhaar_front_url && 'Aadhaar Front',
                    plumber.aadhaar_back_url && 'Aadhaar Back'
                  ].filter(Boolean).join(' • ')}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowImages(true)}
                className="gap-2 w-full sm:w-auto"
              >
                <Eye size={14} />
                View Images
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Images Modal */}
      {showImages && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
              <h3 className="text-sm font-semibold text-[var(--color-text-secondary)]">Uploaded Documents</h3>
              <button
                className="p-1 hover:bg-[var(--color-surface-elevated)] rounded"
                onClick={() => setShowImages(false)}
              >
                <X size={18} className="text-[var(--color-text-muted)]" />
              </button>
            </div>
            <div className="p-4 space-y-6">
              {plumber.photo_url && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide">Profile Photo</p>
                  <div
                    className="relative rounded-lg border border-[var(--color-border)] cursor-pointer overflow-hidden"
                    onClick={() => { setShowImages(false); setSelectedImage(plumber.photo_url); }}
                  >
                    <img src={plumber.photo_url} alt="Profile" className="w-full max-h-64 object-contain" />
                  </div>
                </div>
              )}
              {plumber.aadhaar_front_url && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide">Aadhaar Card Front</p>
                  <div
                    className="relative rounded-lg border border-[var(--color-border)] cursor-pointer overflow-hidden"
                    onClick={() => { setShowImages(false); setSelectedImage(plumber.aadhaar_front_url); }}
                  >
                    <img src={plumber.aadhaar_front_url} alt="Aadhaar Front" className="w-full max-h-80 object-contain" />
                  </div>
                </div>
              )}
              {plumber.aadhaar_back_url && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide">Aadhaar Card Back</p>
                  <div
                    className="relative rounded-lg border border-[var(--color-border)] cursor-pointer overflow-hidden"
                    onClick={() => { setShowImages(false); setSelectedImage(plumber.aadhaar_back_url); }}
                  >
                    <img src={plumber.aadhaar_back_url} alt="Aadhaar Back" className="w-full max-h-80 object-contain" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="bonuses">
        <TabsList>
          <TabsTrigger value="bonuses">Bonus History</TabsTrigger>
          <TabsTrigger value="payouts">Payout History</TabsTrigger>
        </TabsList>
        <TabsContent value="bonuses">
          <BonusHistory plumberId={plumber._id} />
        </TabsContent>
        <TabsContent value="payouts">
          <PayoutHistory plumberId={plumber._id} />
        </TabsContent>
      </Tabs>

      {/* Image Lightbox Modal */}
      <ImageModal
        src={selectedImage}
        alt="Document"
        onClose={() => setSelectedImage(null)}
      />
    </div>
  );
}