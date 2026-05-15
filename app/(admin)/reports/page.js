'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useGetSalesReport, useGetStockReport, useGetPlumberReport, useGetOutstandingReport, useGetDistrictReport, useGetStaffReport } from '@/hooks/useReports';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { formatCurrency } from '@/utils/formatCurrency';
import { JK_DISTRICTS } from '@/utils/constants';
import { Download, TrendingUp, Package, Users, DollarSign, MapPin, UserCheck } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function ReportsPage() {
  return (
    <div className="p-4 md:p-6 space-y-6">
        <PageHeader
          title="Reports"
          subtitle="View sales, stock, plumber, and financial reports"
        />

        <Tabs defaultValue="sales" className="space-y-6">
          <TabsList className="h-auto p-1 flex flex-wrap gap-1">
            <TabsTrigger value="sales" className="data-[state=active]:bg-white data-[state=active]:shadow-sm"><TrendingUp className="w-4 h-4 mr-1" />Sales</TabsTrigger>
            <TabsTrigger value="stock" className="data-[state=active]:bg-white data-[state=active]:shadow-sm"><Package className="w-4 h-4 mr-1" />Stock</TabsTrigger>
            <TabsTrigger value="plumbers" className="data-[state=active]:bg-white data-[state=active]:shadow-sm"><Users className="w-4 h-4 mr-1" />Plumbers</TabsTrigger>
            <TabsTrigger value="outstanding" className="data-[state=active]:bg-white data-[state=active]:shadow-sm"><DollarSign className="w-4 h-4 mr-1" />Out</TabsTrigger>
            <TabsTrigger value="district" className="data-[state=active]:bg-white data-[state=active]:shadow-sm"><MapPin className="w-4 h-4 mr-1" />District</TabsTrigger>
            <TabsTrigger value="staff" className="data-[state=active]:bg-white data-[state=active]:shadow-sm"><UserCheck className="w-4 h-4 mr-1" />Staff</TabsTrigger>
          </TabsList>

          <TabsContent value="sales">
            <SalesReport />
          </TabsContent>
          <TabsContent value="stock">
            <StockReport />
          </TabsContent>
          <TabsContent value="plumbers">
            <PlumberReport />
          </TabsContent>
          <TabsContent value="outstanding">
            <OutstandingReport />
          </TabsContent>
          <TabsContent value="district">
            <DistrictReport />
          </TabsContent>
          <TabsContent value="staff">
            <StaffReport />
          </TabsContent>
        </Tabs>
      </div>

  );
}

function SalesReport() {
  const [filters, setFilters] = useState({ month: '', year: '' });
  const { data, isLoading } = useGetSalesReport(filters);
  const invoices = data?.data?.invoices || [];
  const summary = data?.data?.summary || {};

  const totalSales = summary.grand_total || 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Sales Report</CardTitle>
        <div className="flex gap-2">
          <Input type="month" value={filters.month} onChange={(e) => setFilters({ ...filters, month: e.target.value })} className="w-40" />
          <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2" />Export</Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-12"><LoadingSpinner /></div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Grand Total</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalSales)}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Total Paid</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(summary.total_paid || 0)}</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Outstanding</p>
                <p className="text-2xl font-bold text-purple-600">{formatCurrency(summary.total_outstanding || 0)}</p>
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((inv) => (
                  <TableRow key={inv._id || inv.invoice_number}>
                    <TableCell>{new Date(inv.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="font-medium">{inv.invoice_number}</TableCell>
                    <TableCell>{inv.distributor?.business_name || inv.customer_name || '—'}</TableCell>
                    <TableCell className="capitalize">{inv.invoice_type}</TableCell>
                    <TableCell className="text-right">{formatCurrency(inv.total)}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        inv.payment_status === 'PAID' ? 'bg-green-100 text-green-700' :
                        inv.payment_status === 'PARTIAL' ? 'bg-orange-100 text-orange-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {inv.payment_status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
                {invoices.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No sales data found</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function StockReport() {
  const { data, isLoading } = useGetStockReport();
  const stock = data?.data?.products || [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Stock Report</CardTitle>
        <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2" />Export</Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-12"><LoadingSpinner /></div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Total Products</p>
                <p className="text-2xl font-bold text-blue-600">{stock.length}</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Low Stock Items</p>
                <p className="text-2xl font-bold text-orange-600">{stock.filter(p => p.is_low_stock).length}</p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Out of Stock</p>
                <p className="text-2xl font-bold text-red-600">{stock.filter(p => p.current_stock === 0).length}</p>
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Current Stock</TableHead>
                  <TableHead className="text-right">Threshold</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stock.map((product) => (
                  <TableRow key={product._id || product.sku}>
                    <TableCell className="font-medium">{product.sku}</TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell className="text-right">{product.current_stock}</TableCell>
                    <TableCell className="text-right">{product.low_stock_threshold}</TableCell>
                    <TableCell>
                      {product.current_stock === 0 ? (
                        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">Out of Stock</span>
                      ) : product.is_low_stock ? (
                        <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">Low Stock</span>
                      ) : (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">In Stock</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {stock.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No stock data found</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function PlumberReport() {
  const [filters, setFilters] = useState({ status: 'all' });
  const { data, isLoading } = useGetPlumberReport(filters);
  const plumbers = data?.data || [];

  const verified = plumbers.filter(p => p.verification_status === 'VERIFIED').length;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Plumber Report</CardTitle>
        <div className="flex gap-2">
          <Select value={filters.status} onValueChange={(val) => setFilters({ ...filters, status: val })}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="VERIFIED">Verified</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2" />Export</Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-12"><LoadingSpinner /></div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Total Plumbers</p>
                <p className="text-2xl font-bold text-blue-600">{plumbers.length}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Verified</p>
                <p className="text-2xl font-bold text-green-600">{verified}</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Verification Rate</p>
                <p className="text-2xl font-bold text-purple-600">{plumbers.length > 0 ? Math.round((verified / plumbers.length) * 100) : 0}%</p>
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>District</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Registered</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plumbers.map((plumber) => (
                  <TableRow key={plumber._id}>
                    <TableCell className="font-medium">{plumber.full_name}</TableCell>
                    <TableCell>{plumber.phone}</TableCell>
                    <TableCell>{plumber.district}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        plumber.verification_status === 'VERIFIED' ? 'bg-green-100 text-green-700' :
                        plumber.verification_status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {plumber.verification_status}
                      </span>
                    </TableCell>
                    <TableCell>{new Date(plumber.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
                {plumbers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No plumber data found</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function OutstandingReport() {
  const { data, isLoading } = useGetOutstandingReport();
  const invoices = data?.data?.invoices || [];
  const totals = data?.data?.totals || {};

  const totalOutstanding = totals.total_outstanding || 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Outstanding Report</CardTitle>
        <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2" />Export</Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-12"><LoadingSpinner /></div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Total Outstanding</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(totalOutstanding)}</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Pending Invoices</p>
                <p className="text-2xl font-bold text-orange-600">{totals.count || 0}</p>
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Plumber</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Paid</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead>Overdue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((inv) => (
                  <TableRow key={inv._id || inv.invoice_number}>
                    <TableCell className="font-medium">{inv.invoice_number}</TableCell>
                    <TableCell>{inv.customer || '—'}</TableCell>
                    <TableCell>{inv.plumber || '—'}</TableCell>
                    <TableCell className="text-right">{formatCurrency(inv.amount)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(inv.paid)}</TableCell>
                    <TableCell className="text-right font-medium text-red-600">{formatCurrency(inv.balance)}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 text-xs rounded-full ${inv.days_overdue > 30 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                        {inv.days_overdue}d
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
                {invoices.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No outstanding invoices</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function DistrictReport() {
  const [filters, setFilters] = useState({ district: 'all' });
  const { data, isLoading } = useGetDistrictReport(filters);
  const districts = data?.data?.districts || [];

  const totalPlumbers = districts.reduce((sum, d) => sum + (d.invoice_count || 0), 0);
  const totalSales = districts.reduce((sum, d) => sum + (d.total_sales || 0), 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>District Report</CardTitle>
        <div className="flex gap-2">
          <Select value={filters.district} onValueChange={(val) => setFilters({ ...filters, district: val })}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Districts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Districts</SelectItem>
              {JK_DISTRICTS.map((dist) => (
                <SelectItem key={dist} value={dist}>{dist}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2" />Export</Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-12"><LoadingSpinner /></div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Total Invoices</p>
                <p className="text-2xl font-bold text-blue-600">{totalPlumbers}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Total Sales</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalSales)}</p>
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>District</TableHead>
                  <TableHead className="text-right">Invoices</TableHead>
                  <TableHead className="text-right">Sales</TableHead>
                  <TableHead className="text-right">Avg Sale</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {districts.map((dist) => (
                  <TableRow key={dist._id || dist.district}>
                    <TableCell className="font-medium">{dist.district}</TableCell>
                    <TableCell className="text-right">{dist.invoice_count || 0}</TableCell>
                    <TableCell className="text-right">{formatCurrency(dist.total_sales || 0)}</TableCell>
                    <TableCell className="text-right">
                      {dist.invoice_count > 0 ? formatCurrency((dist.total_sales || 0) / dist.invoice_count) : formatCurrency(0)}
                    </TableCell>
                  </TableRow>
                ))}
                {districts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No district data found</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function StaffReport() {
  const { user, isStaff, isAdmin } = useAuth();
  const [selectedStaff, setSelectedStaff] = useState('');
  const { data, isLoading } = useGetStaffReport({ userId: selectedStaff || undefined });
  const staffData = data?.data;

  const totals = staffData?.totals || {};
  const staffList = staffData?.staff || [];
  const isOwnReport = staffData?.isOwnReport || isStaff;
  const monthly = staffData?.monthly_breakdown || [];
  const topProducts = staffData?.top_products || [];
  const showStaffSelector = isAdmin && !isStaff;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>
          {isOwnReport && !isAdmin ? "My Sales Report" : "Staff Report"}
        </CardTitle>
        <div className="flex gap-2">
          {showStaffSelector && (
            <Select value={selectedStaff || 'all'} onValueChange={(val) => setSelectedStaff(val === 'all' ? '' : val)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Staff" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Staff</SelectItem>
                {staffList.map((s) => (
                  <SelectItem key={s.staff_id} value={s.staff_id}>
                    {s.staff_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2" />Export</Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-12"><LoadingSpinner /></div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Total Invoices</p>
                <p className="text-2xl font-bold text-blue-600">
                  {isOwnReport && !isAdmin
                    ? (staffData?.overview?.total_invoices || staffData?.sales_month_count || 0)
                    : (totals.total_invoices || 0)}
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Collected Revenue</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(isOwnReport && !isAdmin ? (staffData?.sales_month || 0) : (totals.total_revenue || 0))}
                </p>
              </div>
              <div className="p-4 bg-slate-100 rounded-lg">
                <p className="text-sm text-muted-foreground">Invoice Value</p>
                <p className="text-2xl font-bold text-slate-600">
                  {formatCurrency(isOwnReport && !isAdmin ? (staffData?.gross_month || staffData?.overview?.total_revenue || 0) : (totals.total_paid || 0))}
                </p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Outstanding</p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatCurrency(isOwnReport && !isAdmin ? (staffData?.overview?.total_outstanding || 0) : (totals.total_outstanding || 0))}
                </p>
              </div>
            </div>

            {isOwnReport && !isAdmin && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-cyan-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Collected Today</p>
                  <p className="text-xl font-bold text-cyan-600">{formatCurrency(staffData?.sales_today || 0)}</p>
                  <p className="text-xs text-muted-foreground mt-1">{staffData?.sales_today_count || 0} invoices</p>
                </div>
                <div className="p-4 bg-emerald-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Collected This Month</p>
                  <p className="text-xl font-bold text-emerald-600">{formatCurrency(staffData?.sales_month || 0)}</p>
                  <p className="text-xs text-muted-foreground mt-1">{staffData?.sales_month_count || 0} invoices</p>
                </div>
                <div className="p-4 bg-indigo-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Collected This Year</p>
                  <p className="text-xl font-bold text-indigo-600">{formatCurrency(staffData?.sales_year || 0)}</p>
                  <p className="text-xs text-muted-foreground mt-1">{staffData?.sales_year_count || 0} invoices</p>
                </div>
              </div>
            )}

            {/* Admin: all staff table */}
            {isAdmin && !isStaff && !selectedStaff && (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Staff Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="text-right">Invoices</TableHead>
                      <TableHead className="text-right">Collected</TableHead>
                      <TableHead className="text-right">Invoice Value</TableHead>
                      <TableHead className="text-right">Outstanding</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {staffList.map((s) => (
                      <TableRow key={s.staff_id}>
                        <TableCell className="font-medium">{s.staff_name}</TableCell>
                        <TableCell className="capitalize">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            s.staff_role === 'admin' ? 'bg-blue-100 text-blue-700' :
                            s.staff_role === 'superadmin' ? 'bg-purple-100 text-purple-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {s.staff_role}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">{s.invoice_count}</TableCell>
                        <TableCell className="text-right font-medium text-green-700">{formatCurrency(s.collected_revenue || 0)}</TableCell>
                        <TableCell className="text-right text-slate-600">{formatCurrency(s.total_paid || 0)}</TableCell>
                        <TableCell className="text-right text-orange-600">{formatCurrency(s.outstanding || 0)}</TableCell>
                      </TableRow>
                    ))}
                    {staffList.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No staff data found</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                <div className="mt-4 pt-4 border-t flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Total Staff: {totals.total_staff}</span>
                  <span className="text-muted-foreground">Total Collected: {formatCurrency(totals.total_revenue)} | Invoice Value: {formatCurrency(totals.total_paid)} | Outstanding: {formatCurrency(totals.total_outstanding)}</span>
                </div>
              </>
            )}

            {/* Single staff: monthly + top products */}
            {(selectedStaff || isStaff) && staffData && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                {monthly.length > 0 && (
                  <Card className="border-0 shadow-none bg-[#f8fafc]">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Monthly Sales</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Month</TableHead>
                            <TableHead className="text-right">Invoices</TableHead>
                            <TableHead className="text-right">Revenue</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {monthly.map((m) => (
                            <TableRow key={`${m.year}-${m.month}`}>
                              <TableCell>{new Date(m.year, m.month - 1).toLocaleString('default', { month: 'short', year: 'numeric' })}</TableCell>
                              <TableCell className="text-right">{m.invoice_count}</TableCell>
                              <TableCell className="text-right font-medium">{formatCurrency(m.total_revenue)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                )}
                {topProducts.length > 0 && (
                  <Card className="border-0 shadow-none bg-[#f8fafc]">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Top Products Sold</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead className="text-right">Qty</TableHead>
                            <TableHead className="text-right">Revenue</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {topProducts.map((p, i) => (
                            <TableRow key={i}>
                              <TableCell className="font-medium">{p.product_name || 'Unknown'}</TableCell>
                              <TableCell className="text-right">{p.total_qty}</TableCell>
                              <TableCell className="text-right">{formatCurrency(p.total_revenue)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}