'use client';

import { useGetTopPlumbers } from '@/hooks/useDashboard';
import { formatCurrency } from '@/utils/formatCurrency';
import Link from 'next/link';
import { Trophy } from 'lucide-react';

const AVATAR_COLORS = [
  { bg: 'bg-blue-50', text: 'text-blue-600' },
  { bg: 'bg-purple-50', text: 'text-purple-600' },
  { bg: 'bg-emerald-50', text: 'text-emerald-600' },
  { bg: 'bg-amber-50', text: 'text-amber-600' },
  { bg: 'bg-rose-50', text: 'text-rose-600' },
  { bg: 'bg-cyan-50', text: 'text-cyan-600' },
];

function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getAvatarColor(name) {
  if (!name) return AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function TopStaffSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 animate-pulse">
      <div className="h-5 w-40 bg-gray-100 rounded mb-5" />
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-5 h-5 bg-gray-100 rounded" />
            <div className="w-8 h-8 bg-gray-100 rounded-full" />
            <div className="flex-1 h-4 bg-gray-100 rounded" />
            <div className="w-20 h-4 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function TopStaff() {
  const { data, isLoading } = useGetTopPlumbers(5);
  const plumbers = data?.data || [];

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
          <Trophy size={16} className="text-indigo-600" />
        </div>
        <div>
          <h3 className="text-[16px] font-semibold text-gray-900">Top Staff This Month</h3>
        </div>
      </div>

      {isLoading ? (
        <TopStaffSkeleton />
      ) : plumbers.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-gray-400">No staff data yet</p>
        </div>
      ) : (
        <div className="space-y-1">
          {plumbers.map((plumber, index) => {
            const avatarColor = getAvatarColor(plumber.name);
            return (
              <Link
                key={plumber._id}
                href={`/plumbers/${plumber._id}`}
                className="flex items-center gap-4 px-3 py-3 rounded-lg hover:bg-gray-50 transition-colors duration-150 -mx-3"
              >
                <span className="text-[20px] font-bold text-gray-300 w-6 text-center">
                  {index + 1}
                </span>
                <div
                  className={`w-8 h-8 rounded-full ${avatarColor.bg} flex items-center justify-center shrink-0`}
                >
                  <span className={`text-[12px] font-semibold ${avatarColor.text}`}>
                    {getInitials(plumber.name)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] text-gray-900 truncate">{plumber.name}</p>
                  <p className="text-[12px] text-gray-400">
                    {plumber.district} · {plumber.referralCount || plumber.invoiceCount || 0} referrals
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[14px] font-semibold text-gray-900">
                    {formatCurrency(plumber.totalBonus || plumber.totalSales || 0)}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}