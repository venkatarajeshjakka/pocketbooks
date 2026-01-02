/**
 * EntityForm Component
 *
 * Generic reusable form for creating and editing entities (clients/vendors)
 * with modern UI and consistent styling
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Save, X, Info, Plus, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
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
import { EntityStatus } from '@/types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
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

  const [activeSection, setActiveSection] = useState<number>(0);

  return (
    <TooltipProvider>
      <form onSubmit={handleSubmit} className="space-y-12 pb-12">
        <AnimatePresence mode="popLayout">
          {/* Basic Information Section */}
          <motion.div
            key="basic-info"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="relative"
          >
            <Card className="border-border/40 bg-card/60 backdrop-blur-md shadow-xl shadow-primary/5 overflow-hidden group hover:border-primary/20 transition-all duration-500">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-colors" />

              <CardHeader className="flex flex-row items-center gap-4 pb-4 border-b border-border/20 bg-muted/20">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center shadow-inner relative overflow-hidden group-hover:scale-110 transition-transform duration-500">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-50" />
                  <svg className="h-6 w-6 text-primary relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <CardTitle className="text-xl font-bold tracking-tight text-foreground/90">Basic Information</CardTitle>
                  <CardDescription className="text-sm font-medium text-muted-foreground/70">
                    Primary contact and organizational details for this {config.entityType}
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="p-8">
                <div className="grid gap-8 md:grid-cols-2">
                  {/* Entity Name */}
                  <div className="space-y-2.5">
                    <Label htmlFor="name" className="text-sm font-semibold tracking-tight text-foreground/80 flex justify-between">
                      {entityLabel} Name
                      <span className="text-destructive/80 text-[10px] items-center flex gap-1 uppercase font-bold tracking-widest"><div className="h-1 w-1 rounded-full bg-destructive" /> Required</span>
                    </Label>
                    <div className="relative group/input">
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => updateFormField('name', e.target.value)}
                        placeholder={`e.g., ${config.entityType === 'client' ? 'Acme Corporation' : 'ABC Supplies Ltd.'}`}
                        required
                        disabled={isSubmitting}
                        className={cn(
                          "h-12 bg-muted/30 border-border/40 focus:bg-background focus:border-primary/50 transition-all duration-300 shadow-inner rounded-xl pl-4 pr-10",
                          errors.name && 'border-destructive/50 focus:border-destructive shadow-destructive/5'
                        )}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-1.5 py-0.5 rounded-lg bg-muted text-[10px] font-bold text-muted-foreground opacity-0 group-focus-within/input:opacity-100 transition-opacity">
                        {formData.name.length}/100
                      </div>
                    </div>
                    {errors.name && (
                      <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-xs font-semibold text-destructive flex items-center gap-1.5 mt-1.5 px-1">
                        <Info className="h-3 w-3" /> {errors.name}
                      </motion.p>
                    )}
                  </div>

                  {/* Contact Person */}
                  <div className="space-y-2.5">
                    <Label htmlFor="contactPerson" className="text-sm font-semibold tracking-tight text-foreground/80 flex items-center gap-1.5">
                      Contact Person
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 text-muted-foreground opacity-50 hover:opacity-100 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="right" className="bg-popover/90 backdrop-blur-md border-border/30">
                          <p className="text-xs">Primary contact person at the organization</p>
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                    <Input
                      id="contactPerson"
                      value={formData.contactPerson}
                      onChange={(e) => updateFormField('contactPerson', e.target.value)}
                      placeholder="e.g., John Doe"
                      disabled={isSubmitting}
                      className="h-12 bg-muted/30 border-border/40 focus:bg-background focus:border-primary/50 transition-all duration-300 shadow-inner rounded-xl"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2.5">
                    <Label htmlFor="email" className="text-sm font-semibold tracking-tight text-foreground/80 flex justify-between">
                      Email
                      <span className="text-destructive/80 text-[10px] items-center flex gap-1 uppercase font-bold tracking-widest"><div className="h-1 w-1 rounded-full bg-destructive" /> Required</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateFormField('email', e.target.value)}
                      placeholder={`${config.entityType}@example.com`}
                      required
                      disabled={isSubmitting}
                      className={cn(
                        "h-12 bg-muted/30 border-border/40 focus:bg-background focus:border-primary/50 transition-all duration-300 shadow-inner rounded-xl",
                        errors.email && 'border-destructive/50 focus:border-destructive shadow-destructive/5'
                      )}
                    />
                    {errors.email && (
                      <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-xs font-semibold text-destructive flex items-center gap-1.5 mt-1.5 px-1">
                        <Info className="h-3 w-3" /> {errors.email}
                      </motion.p>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="space-y-2.5">
                    <Label htmlFor="phone" className="text-sm font-semibold tracking-tight text-foreground/80 flex items-center gap-1.5">
                      Phone Number
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 text-muted-foreground opacity-50 hover:opacity-100 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="right" className="bg-popover/90 backdrop-blur-md border-border/30">
                          <p className="text-xs">10-digit Indian phone number</p>
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-sm border-r border-border/40 pr-3 pointer-events-none">
                        +91
                      </div>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => updateFormField('phone', formatPhoneNumber(e.target.value))}
                        placeholder="9876543210"
                        disabled={isSubmitting}
                        className={cn(
                          "h-12 bg-muted/30 border-border/40 focus:bg-background focus:border-primary/50 transition-all duration-300 shadow-inner rounded-xl pl-16",
                          errors.phone && 'border-destructive/50 focus:border-destructive shadow-destructive/5'
                        )}
                      />
                    </div>
                    {errors.phone && (
                      <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-xs font-semibold text-destructive flex items-center gap-1.5 mt-1.5 px-1">
                        <Info className="h-3 w-3" /> {errors.phone}
                      </motion.p>
                    )}
                  </div>

                  {/* GST Number */}
                  <div className="space-y-2.5">
                    <Label htmlFor="gstNumber" className="text-sm font-semibold tracking-tight text-foreground/80 flex items-center gap-1.5">
                      GST Number
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 text-muted-foreground opacity-50 hover:opacity-100 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="right" className="bg-popover/90 backdrop-blur-md border-border/30">
                          <p className="text-xs">Format: 22AAAAA0000A1Z5</p>
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                    <Input
                      id="gstNumber"
                      value={formData.gstNumber}
                      onChange={(e) => updateFormField('gstNumber', formatGSTNumber(e.target.value))}
                      placeholder="Enter 15-digit GSTIN"
                      disabled={isSubmitting}
                      className={cn(
                        'h-12 bg-muted/30 border-border/40 focus:bg-background focus:border-primary/50 transition-all duration-300 shadow-inner rounded-xl font-mono uppercase tracking-wider',
                        errors.gstNumber && 'border-destructive/50 focus:border-destructive shadow-destructive/5'
                      )}
                    />
                    {errors.gstNumber && (
                      <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-xs font-semibold text-destructive flex items-center gap-1.5 mt-1.5 px-1">
                        <Info className="h-3 w-3" /> {errors.gstNumber}
                      </motion.p>
                    )}
                  </div>

                  {/* Status */}
                  <div className="space-y-2.5">
                    <Label htmlFor="status" className="text-sm font-semibold tracking-tight text-foreground/80">Current Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => updateFormField('status', value as EntityStatus)}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger id="status" className="h-12 bg-muted/30 border-border/40 focus:bg-background focus:ring-primary/20 transition-all duration-300 shadow-inner rounded-xl px-4">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover/95 backdrop-blur-xl border-border/30 rounded-xl overflow-hidden">
                        <SelectItem value={EntityStatus.ACTIVE} className="focus:bg-primary/10 transition-colors">
                          <div className="flex items-center gap-2.5 py-1">
                            <div className="h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]" />
                            <span className="font-medium">Active</span>
                          </div>
                        </SelectItem>
                        <SelectItem value={EntityStatus.INACTIVE} className="focus:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-2.5 py-1">
                            <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground/40" />
                            <span className="font-medium text-muted-foreground">Inactive</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Vendor-specific: Raw Material Types */}
                  {config.showRawMaterialTypes && (
                    <div className="space-y-4 md:col-span-2 pt-4">
                      <div className="flex items-center justify-between border-b border-border/20 pb-2.5">
                        <Label className="text-base font-bold tracking-tight text-foreground/90 flex items-center gap-2">
                          Raw Material Types
                          <div className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] uppercase tracking-widest font-bold">Selection</div>
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

                      <div className="min-h-[100px] rounded-2xl border border-dashed border-border/60 bg-muted/10 p-6 flex flex-wrap gap-2.5 items-start">
                        {rawMaterialTypesLoading ? (
                          <div className="w-full flex flex-col items-center justify-center py-6 gap-3">
                            <Loader2 className="h-6 w-6 animate-spin text-primary opacity-60" />
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest animate-pulse">Syncing categories...</p>
                          </div>
                        ) : dynamicRawMaterialTypes.length === 0 ? (
                          <div className="w-full h-full flex flex-col items-center justify-center py-4 text-center">
                            <p className="text-sm text-muted-foreground font-medium mb-4 italic opacity-80">
                              Initialize your master data to start tagging vendors
                            </p>
                            <QuickAddRawMaterialType
                              onSuccess={(typeName) => {
                                const current = formData.rawMaterialTypes || [];
                                if (!current.includes(typeName)) {
                                  updateFormField('rawMaterialTypes', [...current, typeName]);
                                }
                              }}
                              trigger={
                                <Button size="sm" variant="secondary" className="gap-2 h-9 border-border/40 hover:bg-background transition-all shadow-sm">
                                  <Plus className="h-4 w-4" />
                                  Initialize Materials
                                </Button>
                              }
                            />
                          </div>
                        ) : (
                          <AnimatePresence mode="popLayout">
                            {dynamicRawMaterialTypes.map((type) => {
                              const isSelected = formData.rawMaterialTypes?.includes(type);
                              return (
                                <motion.button
                                  key={type}
                                  type="button"
                                  layout
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  onClick={() => {
                                    const current = formData.rawMaterialTypes || [];
                                    const updated = isSelected
                                      ? current.filter((t) => t !== type)
                                      : [...current, type];
                                    updateFormField('rawMaterialTypes', updated);
                                  }}
                                  className={cn(
                                    "px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 border flex items-center gap-2 group/tag",
                                    isSelected
                                      ? "bg-primary text-primary-foreground border-primary shadow-[0_4px_12px_rgba(var(--primary-rgb),0.3)] -translate-y-0.5"
                                      : "bg-background/50 text-muted-foreground border-border/40 hover:border-primary/40 hover:text-primary"
                                  )}
                                >
                                  {type}
                                  {isSelected ? (
                                    <X className="h-3.5 w-3.5 transition-transform hover:rotate-90" />
                                  ) : (
                                    <Plus className="h-3 w-3 opacity-40 group-hover/tag:opacity-100 transition-opacity" />
                                  )}
                                </motion.button>
                              );
                            })}
                          </AnimatePresence>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Address Information Section */}
          <motion.div
            key="address-info"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="pt-4"
          >
            <Card className="border-border/40 bg-card/60 backdrop-blur-md shadow-xl shadow-primary/5 overflow-hidden group hover:border-primary/20 transition-all duration-500">
              <CardHeader className="flex flex-row items-center gap-4 pb-4 border-b border-border/20 bg-muted/20">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center shadow-inner relative overflow-hidden group-hover:scale-110 transition-transform duration-500">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-50" />
                  <svg className="h-6 w-6 text-primary relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <CardTitle className="text-xl font-bold tracking-tight text-foreground/90">Workplace Address</CardTitle>
                  <CardDescription className="text-sm font-medium text-muted-foreground/70">
                    Physical location and logistics information
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="p-8 space-y-8">
                {/* Street Address */}
                <div className="space-y-2.5">
                  <Label htmlFor="street" className="text-sm font-semibold tracking-tight text-foreground/80">Street Address</Label>
                  <Textarea
                    id="street"
                    value={formData.address?.street}
                    onChange={(e) => updateAddressField('street', e.target.value)}
                    placeholder="Building number, street name, area, Landmark..."
                    disabled={isSubmitting}
                    rows={3}
                    className="bg-muted/30 border-border/40 focus:bg-background focus:border-primary/50 transition-all duration-500 shadow-inner rounded-2xl resize-none p-4"
                  />
                </div>

                <div className="grid gap-8 md:grid-cols-2">
                  {/* City */}
                  <div className="space-y-2.5">
                    <Label htmlFor="city" className="text-sm font-semibold tracking-tight text-foreground/80">City</Label>
                    <Input
                      id="city"
                      value={formData.address?.city}
                      onChange={(e) => updateAddressField('city', e.target.value)}
                      placeholder="e.g., Mumbai"
                      disabled={isSubmitting}
                      className="h-12 bg-muted/30 border-border/40 focus:bg-background focus:border-primary/50 transition-all duration-300 shadow-inner rounded-xl"
                    />
                  </div>

                  {/* State */}
                  <div className="space-y-2.5">
                    <Label htmlFor="state" className="text-sm font-semibold tracking-tight text-foreground/80">State</Label>
                    <Input
                      id="state"
                      value={formData.address?.state}
                      onChange={(e) => updateAddressField('state', e.target.value)}
                      placeholder="e.g., Maharashtra"
                      disabled={isSubmitting}
                      className="h-12 bg-muted/30 border-border/40 focus:bg-background focus:border-primary/50 transition-all duration-300 shadow-inner rounded-xl"
                    />
                  </div>

                  {/* Postal Code */}
                  <div className="space-y-2.5">
                    <Label htmlFor="postalCode" className="text-sm font-semibold tracking-tight text-foreground/80">Postal Code</Label>
                    <Input
                      id="postalCode"
                      value={formData.address?.postalCode}
                      onChange={(e) => updateAddressField('postalCode', e.target.value)}
                      placeholder="e.g., 400001"
                      disabled={isSubmitting}
                      className="h-12 bg-muted/30 border-border/40 focus:bg-background focus:border-primary/50 transition-all duration-300 shadow-inner rounded-xl"
                    />
                  </div>

                  {/* Country */}
                  <div className="space-y-2.5">
                    <Label htmlFor="country" className="text-sm font-semibold tracking-tight text-foreground/80">Country</Label>
                    <Input
                      id="country"
                      value={formData.address?.country}
                      onChange={(e) => updateAddressField('country', e.target.value)}
                      placeholder="India"
                      disabled={isSubmitting}
                      className="h-12 bg-muted/30 border-border/40 focus:bg-background focus:border-primary/50 transition-all duration-300 shadow-inner rounded-xl"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Submit Error */}
        {errors.submit && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5 backdrop-blur-sm flex items-start gap-4">
            <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
              <X className="h-5 w-5 text-destructive" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-destructive underline decoration-destructive/30 underline-offset-4">Submission Failed</p>
              <p className="text-sm text-destructive/80 font-medium leading-relaxed">{errors.submit}</p>
            </div>
          </motion.div>
        )}

        {/* Form Actions Footer */}
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-background/40 backdrop-blur-2xl border-t border-border/30 z-50 flex flex-col sm:flex-row items-center justify-between gap-6 px-8 md:px-12 shadow-[0_-12px_40px_rgba(0,0,0,0.1)]">
          <div className="hidden sm:flex items-center gap-6 group">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border/20 group-hover:bg-muted transition-colors">
              <kbd className="rounded bg-background px-1.5 py-0.5 text-[10px] uppercase font-bold text-muted-foreground border border-border/40">Ctrl</kbd>
              <Plus className="h-3 w-3 text-muted-foreground/40" />
              <kbd className="rounded bg-background px-1.5 py-0.5 text-[10px] uppercase font-bold text-muted-foreground border border-border/40">S</kbd>
              <span className="text-[11px] font-bold text-muted-foreground/70 tracking-widest uppercase ml-1">Quick Save</span>
            </div>
          </div>

          <div className="flex gap-4 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
              className="h-12 px-8 font-bold border-border/40 hover:bg-muted bg-background/50 backdrop-blur-sm rounded-2xl transition-all w-full sm:w-auto hover:border-border"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-12 px-10 font-bold bg-primary hover:bg-primary/90 rounded-2xl transition-all shadow-xl shadow-primary/20 w-full sm:w-auto relative group overflow-hidden active:scale-95"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2.5">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="tracking-tight uppercase text-xs">{config.mode === 'create' ? 'Onboarding...' : 'Updating...'}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2.5">
                  <Save className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  <span className="tracking-tight uppercase text-xs">{config.mode === 'create' ? `Create ${entityLabel}` : `Save Changes`}</span>
                </div>
              )}
            </Button>
          </div>
        </div>
      </form>
    </TooltipProvider>
  );
}
