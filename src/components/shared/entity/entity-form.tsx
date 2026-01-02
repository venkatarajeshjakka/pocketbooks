/**
 * EntityForm Component
 *
 * Generic reusable form for creating and editing entities (clients/vendors)
 * with modern UI and consistent styling
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Save, X, Info, Plus } from 'lucide-react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { EntityStatus } from '@/types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useRawMaterialTypes } from '@/lib/hooks/use-raw-material-types';
import { QuickAddRawMaterialType } from '@/components/settings/quick-add-raw-material-type';

// Base form data that both clients and vendors share
export interface BaseEntityFormData {
  name: string;
  contactPerson?: string;
  email: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  status?: EntityStatus;
  gstNumber?: string;
}

// Extended form data for vendors
export interface VendorFormData extends BaseEntityFormData {
  specialty?: string;
  rawMaterialTypes?: string[];
}

export interface EntityFormConfig {
  entityType: 'client' | 'vendor';
  mode: 'create' | 'edit';
  entityId?: string;
  returnPath: string;
  // Additional fields for vendors
  showSpecialty?: boolean;
  showRawMaterialTypes?: boolean;
}

export interface EntityFormProps<T extends BaseEntityFormData> {
  config: EntityFormConfig;
  initialData?: T;
  onSubmit: (data: T) => Promise<{ _id?: string | { toString(): string } } | void>;
  isSubmitting?: boolean;
}

type FormErrors = Partial<Record<string, string>>;


export function EntityForm<T extends BaseEntityFormData>({
  config,
  initialData,
  onSubmit,
  isSubmitting = false,
}: EntityFormProps<T>) {
  const router = useRouter();
  const [errors, setErrors] = useState<FormErrors>({});

  // Fetch raw material types dynamically
  const {
    data: rawMaterialTypesData,
    isLoading: rawMaterialTypesLoading,
    error: rawMaterialTypesError
  } = useRawMaterialTypes({ limit: 100 });

  const dynamicRawMaterialTypes = rawMaterialTypesData?.data.map(t => t.name) || [];

  const [formData, setFormData] = useState<VendorFormData>({
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
    specialty: (initialData as VendorFormData)?.specialty || '',
    rawMaterialTypes: (initialData as VendorFormData)?.rawMaterialTypes || [],
  });

  // Reset form when initialData changes (fix reactivity bug)
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        email: initialData.email || '',
        contactPerson: initialData.contactPerson || '',
        phone: initialData.phone || '',
        address: {
          street: initialData.address?.street || '',
          city: initialData.address?.city || '',
          state: initialData.address?.state || '',
          postalCode: initialData.address?.postalCode || '',
          country: initialData.address?.country || 'India',
        },
        status: initialData.status || EntityStatus.ACTIVE,
        gstNumber: initialData.gstNumber || '',
        specialty: (initialData as VendorFormData)?.specialty || '',
        rawMaterialTypes: (initialData as VendorFormData)?.rawMaterialTypes || [],
      });
    }
  }, [initialData]);

  const entityLabel = config.entityType === 'client' ? 'Client' : 'Vendor';

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
      newErrors.name = `${entityLabel} name is required`;
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
      const submitData = {
        ...formData,
        phone: formData.phone?.trim() || undefined,
        contactPerson: formData.contactPerson?.trim() || undefined,
        gstNumber: formData.gstNumber?.trim() || undefined,
        specialty: config.showSpecialty ? (formData.specialty?.trim() || undefined) : undefined,
        rawMaterialTypes: config.showRawMaterialTypes ? formData.rawMaterialTypes : undefined,
      } as unknown as T;

      const result = await onSubmit(submitData);

      if (config.mode === 'create' && result?._id) {
        const id = typeof result._id === 'string' ? result._id : result._id.toString();
        router.push(`${config.returnPath}/${id}`);
      } else if (config.mode === 'edit' && config.entityId) {
        router.push(`${config.returnPath}/${config.entityId}`);
      } else {
        router.push(config.returnPath);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : `Failed to ${config.mode} ${config.entityType}`;
      setErrors({ submit: message });
    }
  };

  const updateFormField = <K extends keyof VendorFormData>(field: K, value: VendorFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const updateAddressField = (field: keyof NonNullable<VendorFormData['address']>, value: string) => {
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
              <p className="text-sm text-muted-foreground">Enter the {config.entityType}&apos;s basic contact details</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Entity Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                {entityLabel} Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateFormField('name', e.target.value)}
                placeholder={`e.g., ${config.entityType === 'client' ? 'Acme Corporation' : 'ABC Supplies Ltd.'}`}
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
                    <p>Primary contact person at the {config.entityType}&apos;s organization</p>
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
                placeholder={`${config.entityType}@example.com`}
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

            {/* Vendor-specific: Raw Material Types */}
            {config.showRawMaterialTypes && (
              <div className="space-y-3 md:col-span-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium flex items-center gap-1">
                    Raw Material Types
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Select the types of raw materials provided by this vendor</p>
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <QuickAddRawMaterialType
                    onSuccess={(typeName) => {
                      const current = formData.rawMaterialTypes || [];
                      if (!current.includes(typeName)) {
                        updateFormField('rawMaterialTypes', [...current, typeName]);
                      }
                    }}
                  />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-3 pt-2">
                  {rawMaterialTypesLoading ? (
                    <div className="col-span-4 flex items-center justify-center py-4">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : rawMaterialTypesError ? (
                    <div className="col-span-4 text-sm text-destructive py-2">
                      Failed to load material types
                    </div>
                  ) : dynamicRawMaterialTypes.length === 0 ? (
                    <div className="col-span-4 flex flex-col items-center justify-center py-8 px-4 rounded-lg border border-dashed border-border/50 bg-muted/20">
                      <p className="text-sm text-muted-foreground mb-4 text-center">
                        No raw material types are configured yet.<br />
                        Create one to start associating them with vendors.
                      </p>
                      <QuickAddRawMaterialType
                        onSuccess={(typeName) => {
                          const current = formData.rawMaterialTypes || [];
                          if (!current.includes(typeName)) {
                            updateFormField('rawMaterialTypes', [...current, typeName]);
                          }
                        }}
                        trigger={
                          <Button size="sm" variant="secondary" className="gap-2">
                            <Plus className="h-4 w-4" />
                            Initialize Material Types
                          </Button>
                        }
                      />
                    </div>
                  ) : (
                    dynamicRawMaterialTypes.map((type) => (
                      <div key={type} className="flex items-center space-x-2 py-1">
                        <Checkbox
                          id={`type-${type}`}
                          checked={formData.rawMaterialTypes?.includes(type)}
                          onCheckedChange={(checked) => {
                            const current = formData.rawMaterialTypes || [];
                            const updated = checked
                              ? [...current, type]
                              : current.filter((t) => t !== type);
                            updateFormField('rawMaterialTypes', updated);
                          }}
                          disabled={isSubmitting}
                        />
                        <label
                          htmlFor={`type-${type}`}
                          className="text-sm cursor-pointer hover:text-primary transition-colors"
                        >
                          {type}
                        </label>
                      </div>
                    ))
                  )}
                </div>
                {formData.rawMaterialTypes && formData.rawMaterialTypes.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {formData.rawMaterialTypes.map((type) => (
                      <Badge key={type} variant="secondary" className="px-2 py-0 text-xs font-normal">
                        {type}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}
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
              <p className="text-sm text-muted-foreground">Enter the {config.entityType}&apos;s address details</p>
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
                  {config.mode === 'create' ? 'Creating...' : 'Updating...'}
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {config.mode === 'create' ? `Create ${entityLabel}` : `Update ${entityLabel}`}
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </TooltipProvider>
  );
}
