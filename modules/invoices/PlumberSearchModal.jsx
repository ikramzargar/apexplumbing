'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPlumbers } from '@/lib/plumbers.api';
import { formatCurrency } from '@/utils/formatCurrency';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, User, Phone, MapPin, Award, AlertCircle, X } from 'lucide-react';

export function PlumberSearchModal({ isOpen, onClose, onSelect }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('name');

  const buildSearchQuery = () => {
    if (!searchTerm || searchTerm.length < 2) return '';
    if (searchType === 'code') return searchTerm;
    return searchTerm;
  };

  const { data: plumbersData, isLoading } = useQuery({
    queryKey: ['plumbers-for-search', searchTerm, searchType],
    queryFn: () => getPlumbers({ search: buildSearchQuery(), limit: 50 }),
    enabled: searchTerm.length >= 2,
  });

  const plumbers = plumbersData?.data?.plumbers || [];

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
      setSearchType('name');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelect = (plumber) => {
    onSelect(plumber);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#e8edf5]">
          <div>
            <h2 className="text-lg font-semibold text-[#061b31]">Link Plumber</h2>
            <p className="text-xs text-[#64748d]">Search for a plumber to link to this invoice</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X size={18} />
          </Button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-[#e8edf5] space-y-3">
          {/* Search Type Tabs */}
          <div className="flex gap-2">
            {[
              { id: 'name', label: 'By Name' },
              { id: 'phone', label: 'By Phone' },
              { id: 'code', label: 'By Referral Code' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSearchType(tab.id)}
                className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                  searchType === tab.id
                    ? 'bg-[#533afd] text-white'
                    : 'bg-[#f8fafc] text-[#64748d] hover:bg-[#f1f5f9]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8] w-4 h-4" />
            <Input
              placeholder={
                searchType === 'name'
                  ? 'Search by plumber name...'
                  : searchType === 'phone'
                  ? 'Search by phone number...'
                  : 'Search by referral code...'
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10"
              autoFocus
            />
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-[#533afd]/30 border-t-[#533afd] rounded-full animate-spin" />
            </div>
          ) : searchTerm.length < 2 ? (
            <div className="text-center py-8 text-[#64748d]">
              <Search size={32} className="mx-auto mb-2 text-[#94a3b8]" />
              <p className="text-sm">Enter at least 2 characters to search</p>
            </div>
          ) : plumbers.length === 0 ? (
            <div className="text-center py-8 text-[#64748d]">
              <User size={32} className="mx-auto mb-2 text-[#94a3b8]" />
              <p className="text-sm">No plumbers found matching "{searchTerm}"</p>
            </div>
          ) : (
            <div className="space-y-2">
              {plumbers.map((plumber) => (
                <div
                  key={plumber._id}
                  className="p-3 rounded-lg border border-[#e8edf5] hover:bg-[#f8fafc] cursor-pointer transition-colors"
                  onClick={() => handleSelect(plumber)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-[#061b31]">{plumber.full_name}</p>
                        {plumber.verification_status === 'VERIFIED' ? (
                          <Badge variant="success" className="text-[9px]">Verified</Badge>
                        ) : plumber.verification_status === 'PENDING' ? (
                          <Badge variant="warning" className="text-[9px]">Pending</Badge>
                        ) : (
                          <Badge variant="destructive" className="text-[9px]">Rejected</Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#64748d]">
                        <span className="flex items-center gap-1">
                          <Phone size={12} />
                          {plumber.phone}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin size={12} />
                          {plumber.district}
                        </span>
                        {plumber.referral_code && (
                          <span className="flex items-center gap-1">
                            <Award size={12} />
                            {plumber.referral_code}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      {plumber.verification_status !== 'VERIFIED' && (
                        <div className="flex items-center gap-1 text-[10px] text-orange-600 mb-1">
                          <AlertCircle size={12} />
                          <span>Bonus will be held</span>
                        </div>
                      )}
                      <div className="text-[10px] text-[#94a3b8]">
                        {plumber.total_referrals || 0} referrals
                      </div>
                      <div className="text-[10px] text-[#94a3b8]">
                        Balance: {formatCurrency(plumber.balance_due || 0)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#e8edf5] bg-[#f8fafc] rounded-b-xl">
          <p className="text-[10px] text-[#94a3b8] text-center">
            {plumbers.length > 0 && (
              <>
                {plumbers.filter(p => p.verification_status === 'VERIFIED').length} verified,{' '}
                {plumbers.filter(p => p.verification_status !== 'VERIFIED').length} pending
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}