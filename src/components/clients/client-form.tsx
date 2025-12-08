/**
 * Client Form Component
 * 
 * Reusable form for creating and editing clients with modern UI
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Save, X, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { IClient, IClientInput, EntityStatus } from '@/types';
import { useCreateClient, useUpdateClient } from '@/lib/hooks/use-clients';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ClientFormProps {
  mode: 'create' | 'edit';
  clientId?: string;
  initialData?: IClient;
}

type FormData = IClientInput;
type FormErrors = Partial<Record<keyof FormData | 'submit', string>>;

export function ClientForm({ mode, clientId, initialData }: ClientFormProps) {
  const router = useRouter();
  const [errors, setErrors] = useState<FormErrors>({});

  const createClientMutation = useCreateClient();
  const updateClientMutation = useUpdateClient();
  const isSubmitting = createClientMutation.isPending || updateClientMutation.isPending;

  const [formData, setFormData] = useState<FormData>({
    name: initialData?.name || '',
    email: initialData?.email || '',
    contactPerson: initialData?.contactPerson || '',
    phone: initialData?.phone || '',
    address: {
      street: initialData?.address?.street || '',
      city: initialData?.address?.city || '',
      state: initialData?.address?.state || '',
      postalCode: initialData?.address?.postalCode || '',
      country: initialData?.address?.country || 'India',
    },
    status: initialData?.status || EntityStatus.ACTIVE,
    gstNumber: initialData?.gstNumber || '',
  });

  // Keyboard shortcut: Ctrl+S to save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        const form = document.querySelector('form');
        if (form) {
          form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Client name is required';
    }

    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please provide a valid email address';
    }

    if (formData.phone && !/^[6-9]\d{9}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please provide a valid 10-digit Indian phone number';
    }

    if (formData.gstNumber && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gstNumber)) {
      newErrors.gstNumber = 'Please provide a valid GST number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setErrors({});

    try {
      const submitData: IClientInput = {
        ...formData,
        phone: formData.phone?.trim() || undefined,
        contactPerson: formData.contactPerson?.trim() || undefined,
        gstNumber: formData.gstNumber?.trim() || undefined,
      };

      if (mode === 'create') {
        const response = await createClientMutation.mutateAsync(submitData);
        router.push(`/clients/${response.data?._id}`);
      } else if (mode === 'edit' && clientId) {
        await updateClientMutation.mutateAsync({ id: clientId, input: submitData });
        router.push(`/clients/${clientId}`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : `Failed to ${mode} client`;
      setErrors({ submit: message });
    }
  };

  const updateFormField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const updateAddressField = (field: keyof NonNullable<FormData['address']>, value: string) => {
    setFormData((prev) => ({
      ...prev,
      address: { ...prev.address, [field]: value },
    }));
  };

  const formatPhoneNumber = (value: string) => {
    return value.replace(/\D/g, '').slice(0, 10);
  };

  const formatGSTNumber = (value: string) => {
    return value.toUpperCase().slice(0, 15);
  };

  return (
    <TooltipProvider>
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 pb-2 border-b border-border">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Basic Information</h2>
              <p className="text-sm text-muted-foreground">Enter the client&apos;s basic contact details</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Client Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Client Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateFormField('name', e.target.value)}
                placeholder="e.g., Acme Corporation"
                required
                disabled={isSubmitting}
                className={cn(errors.name && 'border-destructive')}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
              <p className="text-xs text-muted-foreground">{formData.name.length}/100 characters</p>
            </div>

            {/* Contact Person */}
            <div className="space-y-2">
              <Label htmlFor="contactPerson" className="text-sm font-medium flex items-center gap-1">
                Contact Person
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3.5 w-3.5 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Primary contact person at the client&apos;s organization</p>
                  </TooltipContent>
                </Tooltip>
              </Label>
              <Input
                id="contactPerson"
                value={formData.contactPerson}
                onChange={(e) => updateFormField('contactPerson', e.target.value)}
                placeholder="e.g., John Doe"
                disabled={isSubmitting}
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => updateFormField('email', e.target.value)}
                placeholder="client@example.com"
                required
                disabled={isSubmitting}
                className={cn(errors.email && 'border-destructive')}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-1">
                Phone
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3.5 w-3.5 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>10-digit Indian phone number</p>
                  </TooltipContent>
                </Tooltip>
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => updateFormField('phone', formatPhoneNumber(e.target.value))}
                placeholder="9876543210"
                disabled={isSubmitting}
                className={cn(errors.phone && 'border-destructive')}
              />
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone}</p>
              )}
            </div>

            {/* GST Number */}
            <div className="space-y-2">
              <Label htmlFor="gstNumber" className="text-sm font-medium flex items-center gap-1">
                GST Number
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3.5 w-3.5 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Format: 22AAAAA0000A1Z5</p>
                  </TooltipContent>
                </Tooltip>
              </Label>
              <Input
                id="gstNumber"
                value={formData.gstNumber}
                onChange={(e) => updateFormField('gstNumber', formatGSTNumber(e.target.value))}
                placeholder="22AAAAA0000A1Z5"
                disabled={isSubmitting}
                className={cn('font-mono', errors.gstNumber && 'border-destructive')}
              />
              {errors.gstNumber && (
                <p className="text-sm text-destructive">{errors.gstNumber}</p>
              )}
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm font-medium">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => updateFormField('status', value as EntityStatus)}
                disabled={isSubmitting}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={EntityStatus.ACTIVE}>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      Active
                    </div>
                  </SelectItem>
                  <SelectItem value={EntityStatus.INACTIVE}>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-muted-foreground" />
                      Inactive
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Address Information Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 pb-2 border-b border-border">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Address Information</h2>
              <p className="text-sm text-muted-foreground">Enter the client&apos;s address details</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Street Address */}
            <div className="space-y-2">
              <Label htmlFor="street" className="text-sm font-medium">Street Address</Label>
              <Textarea
                id="street"
                value={formData.address?.street}
                onChange={(e) => updateAddressField('street', e.target.value)}
                placeholder="Building number, street name, area"
                disabled={isSubmitting}
                rows={2}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {/* City */}
              <div className="space-y-2">
                <Label htmlFor="city" className="text-sm font-medium">City</Label>
                <Input
                  id="city"
                  value={formData.address?.city}
                  onChange={(e) => updateAddressField('city', e.target.value)}
                  placeholder="e.g., Mumbai"
                  disabled={isSubmitting}
                />
              </div>

              {/* State */}
              <div className="space-y-2">
                <Label htmlFor="state" className="text-sm font-medium">State</Label>
                <Input
                  id="state"
                  value={formData.address?.state}
                  onChange={(e) => updateAddressField('state', e.target.value)}
                  placeholder="e.g., Maharashtra"
                  disabled={isSubmitting}
                />
              </div>

              {/* Postal Code */}
              <div className="space-y-2">
                <Label htmlFor="postalCode" className="text-sm font-medium">Postal Code</Label>
                <Input
                  id="postalCode"
                  value={formData.address?.postalCode}
                  onChange={(e) => updateAddressField('postalCode', e.target.value)}
                  placeholder="e.g., 400001"
                  disabled={isSubmitting}
                />
              </div>

              {/* Country */}
              <div className="space-y-2">
                <Label htmlFor="country" className="text-sm font-medium">Country</Label>
                <Input
                  id="country"
                  value={formData.address?.country}
                  onChange={(e) => updateAddressField('country', e.target.value)}
                  placeholder="India"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
            <p className="text-sm text-destructive">{errors.submit}</p>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-6">
          <div className="text-sm text-muted-foreground hidden sm:block">
            <kbd className="rounded bg-muted px-2 py-1 text-xs border border-border">Ctrl</kbd>
            {' + '}
            <kbd className="rounded bg-muted px-2 py-1 text-xs border border-border">S</kbd>
            {' to save'}
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
              className="flex-1 sm:flex-none"
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1 sm:flex-none">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {mode === 'create' ? 'Creating...' : 'Updating...'}
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {mode === 'create' ? 'Create Client' : 'Update Client'}
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </TooltipProvider>
  );
}
