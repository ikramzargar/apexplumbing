'use client';

import { useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { JK_DISTRICTS } from '@/utils/constants';
import { Upload, X, Camera } from 'lucide-react';
import { showError } from '@/utils/toast';

export function PlumberForm({ initialData, onSubmit, loading }) {
  const [form, setForm] = useState({
    full_name: initialData?.full_name || '',
    phone: initialData?.phone || '',
    alt_phone: initialData?.alt_phone || '',
    aadhaar_number: initialData?.aadhaar_number || '',
    address: initialData?.address || '',
    district: initialData?.district || '',
    bank_account: initialData?.bank_account || '',
    ifsc: initialData?.ifsc || '',
    bank_name: initialData?.bank_name || '',
    notes: initialData?.notes || '',
  });

  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(initialData?.photo_url || null);
  const [aadhaarFront, setAadhaarFront] = useState(null);
  const [aadhaarFrontPreview, setAadhaarFrontPreview] = useState(initialData?.aadhaar_front_url || null);
  const [aadhaarBack, setAadhaarBack] = useState(null);
  const [aadhaarBackPreview, setAadhaarBackPreview] = useState(initialData?.aadhaar_back_url || null);

  const photoRef = useRef();
  const aadhaarFrontRef = useRef();
  const aadhaarBackRef = useRef();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (setFile, setPreview) => (e) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate required fields
    if (!form.full_name?.trim()) {
      showError('Please enter the plumber\'s full name');
      return;
    }

    if (!form.phone?.trim()) {
      showError('Please enter the phone number');
      return;
    }

    if (!form.phone.match(/^\d{10}$/)) {
      showError('Phone number must be exactly 10 digits');
      return;
    }

    if (!form.aadhaar_number?.trim()) {
      showError('Please enter the aadhaar number');
      return;
    }

    if (!form.aadhaar_number.match(/^\d{12}$/)) {
      showError('Aadhaar number must be exactly 12 digits');
      return;
    }

    if (!form.address?.trim()) {
      showError('Please enter the address');
      return;
    }

    if (!form.district) {
      showError('Please select the district');
      return;
    }

    // Check photos (at least one required)
    if (!photo && !aadhaarFront && !aadhaarBack && !photoPreview && !aadhaarFrontPreview && !aadhaarBackPreview) {
      showError('Please upload at least one photo (plumber photo or aadhaar card)');
      return;
    }

    const submitData = {
      ...form,
      photo,
      aadhaar_front: aadhaarFront,
      aadhaar_back: aadhaarBack,
    };
    onSubmit(submitData);
  };

  const ImageUploadBox = ({ label, preview, onClick, required }) => (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs font-medium text-[#64748d] uppercase tracking-wide">{label}</Label>
      <button
        type="button"
        onClick={onClick}
        className="relative w-full h-28 border-2 border-dashed border-[#e8edf5] rounded-lg flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:border-[#533afd] hover:bg-[#533afd]/5 transition-all duration-150 bg-[#fafbfc]"
      >
        {preview ? (
          <>
            <img src={preview} alt={label} className="h-full w-full object-cover rounded" />
            <span className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full" onClick={(e) => { e.stopPropagation(); onClick(); }}>
              <X size={12} />
            </span>
          </>
        ) : (
          <>
            <Upload size={16} className="text-[#94a3b8]" />
            <span className="text-[10px] text-[#94a3b8]">{required ? 'Required' : 'Optional'}</span>
          </>
        )}
      </button>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Photo Upload Section */}
      <div className="bg-[#f8fafc] rounded-lg p-4 border border-[#e8edf5]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ImageUploadBox
            label="Plumber Photo"
            preview={photoPreview}
            onClick={() => photoRef.current?.click()}
          />
          <ImageUploadBox
            label="Aadhaar Front"
            preview={aadhaarFrontPreview}
            onClick={() => aadhaarFrontRef.current?.click()}
          />
          <ImageUploadBox
            label="Aadhaar Back"
            preview={aadhaarBackPreview}
            onClick={() => aadhaarBackRef.current?.click()}
          />
        </div>
      </div>

      {/* Basic Info */}
      <div className="space-y-4">
        <h3 className="text-xs font-semibold text-[#061b31] uppercase tracking-wide pb-2 border-b border-[#e8edf5]">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="full_name">Full Name</Label>
            <Input id="full_name" name="full_name" value={form.full_name} onChange={handleChange} placeholder="Enter full name" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" name="phone" value={form.phone} onChange={handleChange} placeholder="Enter phone number" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="alt_phone">Alternate Phone</Label>
            <Input id="alt_phone" name="alt_phone" value={form.alt_phone} onChange={handleChange} placeholder="Optional" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="aadhaar_number">Aadhaar Number</Label>
            <Input id="aadhaar_number" name="aadhaar_number" value={form.aadhaar_number} onChange={handleChange} placeholder="12 digit aadhaar" required maxLength={12} />
          </div>
        </div>
      </div>

      {/* Address Info */}
      <div className="space-y-4">
        <h3 className="text-xs font-semibold text-[#061b31] uppercase tracking-wide pb-2 border-b border-[#e8edf5]">Address & Location</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Textarea id="address" name="address" value={form.address} onChange={handleChange} placeholder="Full address" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="district">District</Label>
            <Select value={form.district} onValueChange={(val) => setForm({ ...form, district: val })}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select district" />
              </SelectTrigger>
              <SelectContent>
                {JK_DISTRICTS.map((district) => (
                  <SelectItem key={district} value={district}>
                    {district}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Bank Info */}
      <div className="space-y-4">
        <h3 className="text-xs font-semibold text-[#061b31] uppercase tracking-wide pb-2 border-b border-[#e8edf5]">Bank Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="bank_account">Bank Account</Label>
            <Input id="bank_account" name="bank_account" value={form.bank_account} onChange={handleChange} placeholder="Account number" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ifsc">IFSC Code</Label>
            <Input id="ifsc" name="ifsc" value={form.ifsc} onChange={handleChange} placeholder="IFSC code" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bank_name">Bank Name</Label>
            <Input id="bank_name" name="bank_name" value={form.bank_name} onChange={handleChange} placeholder="Bank name" />
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-4">
        <h3 className="text-xs font-semibold text-[#061b31] uppercase tracking-wide pb-2 border-b border-[#e8edf5]">Additional Notes</h3>
        <div className="space-y-1.5">
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" name="notes" value={form.notes} onChange={handleChange} placeholder="Any additional notes..." />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-[#e8edf5]">
        <Button type="submit" disabled={loading} className="min-w-[120px] w-full sm:w-auto">
          {loading ? 'Saving...' : initialData ? 'Update Plumber' : 'Add Plumber'}
        </Button>
        <Button type="button" variant="outline" onClick={() => window.history.back()} className="w-full sm:w-auto">
          Cancel
        </Button>
      </div>

      {/* Hidden file inputs */}
      <input ref={photoRef} type="file" accept="image/*" onChange={handleFileChange(setPhoto, setPhotoPreview)} className="hidden" />
      <input ref={aadhaarFrontRef} type="file" accept="image/*" onChange={handleFileChange(setAadhaarFront, setAadhaarFrontPreview)} className="hidden" />
      <input ref={aadhaarBackRef} type="file" accept="image/*" onChange={handleFileChange(setAadhaarBack, setAadhaarBackPreview)} className="hidden" />
    </form>
  );
}