'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { showApiError } from '@/utils/toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Building2, Mail, Lock } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login(form.email, form.password);
      const { user } = result.data;

      if (user.role === 'distributor') {
        router.push('/portal/dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      showApiError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] to-[#1e293b] p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#0ea5e9]/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#0ea5e9]/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-[400px] relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-[#0ea5e9] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#0ea5e9]/20">
            <Building2 size={28} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-[#f1f5f9] tracking-tight">APEX PLUMBING</h1>
          <p className="text-xs text-[#94a3b8] mt-1">Business Management System</p>
        </div>

        {/* Login Card */}
        <div className="bg-[#1e293b] rounded-2xl border border-[#334155] shadow-lg shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] p-8">
          <h2 className="text-lg font-semibold text-[#f1f5f9] mb-1">Welcome back</h2>
          <p className="text-xs text-[#94a3b8] mb-6">Sign in to continue to dashboard</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs text-[#94a3b8]">Email / Portal Email</Label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="pl-10 bg-[#0f172a] border-[#334155] text-[#f1f5f9] placeholder-[#64748b]"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs text-[#94a3b8]">Password</Label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="pl-10 bg-[#0f172a] border-[#334155] text-[#f1f5f9] placeholder-[#64748b]"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full h-10 bg-[#0ea5e9] hover:bg-[#0284c7] text-white" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-[#334155] text-center">
            <p className="text-[10px] text-[#64748b]">
              Distributors: log in with your portal email
            </p>
          </div>
        </div>

        <p className="text-center text-[10px] text-[#64748b] mt-6">
          © 2024 APEX PLUMBING. All rights reserved.
        </p>
      </div>
    </div>
  );
}