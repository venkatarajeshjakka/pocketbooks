/**
 * EntityForm Component
 *
 * Generic reusable form for creating and editing entities (clients/vendors)
 * with modern UI and consistent styling
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Save, Info, Plus } from 'lucide-react';
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
import { EditPreviewDialog } from './edit-preview-dialog';

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

interface FormChange {
  field: string;
  label: string;
  oldValue: any;
  newValue: any;
  type?: 'text' | 'price' | 'date' | 'status' | 'list';
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
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [changes, setChanges] = useState<FormChange[]>([]);

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

    if (config.mode === 'edit') {
      const detectedChanges = getDetectedChanges();
      if (detectedChanges.length > 0) {
        setChanges(detectedChanges);
        setIsPreviewOpen(true);
        return;
      }
    }

    await actualSubmit();
  };

  const getDetectedChanges = () => {
    const changes: FormChange[] = [];
    const labels: Record<string, string> = {
      name: `${entityLabel} Name`,
      email: 'Email',
      contactPerson: 'Contact Person',
      phone: 'Phone',
      status: 'Status',
      gstNumber: 'GST Number',
      specialty: 'Specialty',
      rawMaterialTypes: 'Material Types'
    };

    const fieldTypes: Record<string, FormChange['type']> = {
      status: 'status',
      rawMaterialTypes: 'list'
    };

    Object.keys(labels).forEach(key => {
      const oldValue = (initialData as Record<string, any> | undefined)?.[key];
      const newValue = (formData as Record<string, any>)[key];

      if (key === 'rawMaterialTypes') {
        if (JSON.stringify(oldValue || []) !== JSON.stringify(newValue || [])) {
          changes.push({
            field: key,
            label: labels[key],
            oldValue: (oldValue as string[] || []).join(', ') || 'None',
            newValue: (newValue as string[] || []).join(', ') || 'None',
            type: 'list'
          });
        }
      } else if (oldValue !== newValue && newValue !== undefined) {
        changes.push({
          field: key,
          label: labels[key],
          oldValue: oldValue ?? 'Empty',
          newValue: newValue ?? 'Empty',
          type: fieldTypes[key] || 'text'
        });
      }
    });

    return changes;
  };

  const actualSubmit = async () => {
    setIsPreviewOpen(false);
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
      toast.success(`${entityLabel} saved successfully`);

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
          {/* Section 1: Entity Profile */}
          <motion.div
            key="profile-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card className="border-border/40 bg-card/60 backdrop-blur-md shadow-xl overflow-hidden">
              <CardHeader className="flex flex-row items-center gap-4 pb-4 border-b border-border/20 bg-muted/20">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Info className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold">Profile Details</CardTitle>
                  <CardDescription>Primary identification for this {config.entityType}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="flex justify-between">
                      {entityLabel} Name
                      <span className="text-[10px] font-bold text-destructive uppercase tracking-widest">* Required</span>
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => updateFormField('name', e.target.value)}
                      placeholder="Organization or Person Name"
                      className={cn(errors.name && "border-destructive")}
                    />
                    {errors.name && <p className="text-xs font-medium text-destructive">{errors.name}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gstNumber">GST Number</Label>
                    <Input
                      id="gstNumber"
                      value={formData.gstNumber}
                      onChange={(e) => updateFormField('gstNumber', formatGSTNumber(e.target.value))}
                      placeholder="15-digit GSTIN"
                      className="font-mono uppercase"
                    />
                    {errors.gstNumber && <p className="text-xs font-medium text-destructive">{errors.gstNumber}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Account Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => updateFormField('status', value as EntityStatus)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={EntityStatus.ACTIVE}>Active</SelectItem>
                        <SelectItem value={EntityStatus.INACTIVE}>Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Section 2: Communication */}
          <motion.div
            key="comm-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card className="border-border/40 bg-card/60 backdrop-blur-md shadow-xl overflow-hidden">
              <CardHeader className="flex flex-row items-center gap-4 pb-4 border-b border-border/20 bg-muted/30">
                <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center text-success">
                  <Save className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold">Communication</CardTitle>
                  <CardDescription>Contact person and touchpoints</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="contactPerson">Contact Person</Label>
                    <Input
                      id="contactPerson"
                      value={formData.contactPerson}
                      onChange={(e) => updateFormField('contactPerson', e.target.value)}
                      placeholder="Name of primary contact"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex justify-between">
                      Email
                      <span className="text-[10px] font-bold text-destructive uppercase tracking-widest">* Required</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateFormField('email', e.target.value)}
                      placeholder="email@example.com"
                      className={cn(errors.email && "border-destructive")}
                    />
                    {errors.email && <p className="text-xs font-medium text-destructive">{errors.email}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => updateFormField('phone', formatPhoneNumber(e.target.value))}
                      placeholder="10-digit number"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Vendor specific material types */}
          {config.showRawMaterialTypes && (
            <motion.div
              key="material-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <Card className="border-border/40 bg-card/60 backdrop-blur-md shadow-xl overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/20 bg-primary/5">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <Plus className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold">Materials Supplied</CardTitle>
                      <CardDescription>Types of raw materials provided by this vendor</CardDescription>
                    </div>
                  </div>
                  <QuickAddRawMaterialType
                    onSuccess={(typeName) => {
                      const current = formData.rawMaterialTypes || [];
                      if (!current.includes(typeName)) {
                        updateFormField('rawMaterialTypes', [...current, typeName]);
                      }
                    }}
                  />
                </CardHeader>
                <CardContent className="p-6">
                  {rawMaterialTypesLoading ? (
                    <div className="flex justify-center py-8"><Loader2 className="animate-spin" /></div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {dynamicRawMaterialTypes.map((type) => {
                        const isSelected = formData.rawMaterialTypes?.includes(type);
                        return (
                          <Button
                            key={type}
                            type="button"
                            variant={isSelected ? "default" : "outline"}
                            size="sm"
                            className="rounded-full"
                            onClick={() => {
                              const current = formData.rawMaterialTypes || [];
                              const updated = isSelected
                                ? current.filter((t) => t !== type)
                                : [...current, type];
                              updateFormField('rawMaterialTypes', updated);
                            }}
                          >
                            {type}
                          </Button>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Address Information Section */}
          <motion.div
            key="address-info"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <Card className="border-border/40 bg-card/60 backdrop-blur-md shadow-xl overflow-hidden">
              <CardHeader className="flex flex-row items-center gap-4 pb-4 border-b border-border/20 bg-muted/20">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <CardTitle className="text-lg font-bold">Location</CardTitle>
                  <CardDescription>Address and logistics details</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="street">Street Address</Label>
                  <Textarea
                    id="street"
                    value={formData.address?.street}
                    onChange={(e) => updateAddressField('street', e.target.value)}
                    placeholder="Street, Landmark, Area..."
                    rows={2}
                    className="bg-muted/30 border-border/40 focus:bg-background focus:border-primary/50 transition-all duration-300 rounded-xl"
                  />
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.address?.city}
                      onChange={(e) => updateAddressField('city', e.target.value)}
                      placeholder="City"
                      className="bg-muted/30 border-border/40 focus:bg-background focus:ring-primary/20 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={formData.address?.state}
                      onChange={(e) => updateAddressField('state', e.target.value)}
                      placeholder="State"
                      className="bg-muted/30 border-border/40 focus:bg-background focus:ring-primary/20 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input
                      id="postalCode"
                      value={formData.address?.postalCode}
                      onChange={(e) => updateAddressField('postalCode', e.target.value)}
                      placeholder="6-digit code"
                      className="bg-muted/30 border-border/40 focus:bg-background focus:ring-primary/20 rounded-xl"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Submit Error */}
        {errors.submit && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
            {errors.submit}
          </motion.div>
        )}

        {/* Form Actions Footer */}
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-background/60 backdrop-blur-xl border-t border-border/30 z-50 flex items-center justify-end gap-4 shadow-lg">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
            className="rounded-xl px-8"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl px-10 shadow-lg shadow-primary/20"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {config.mode === 'create' ? `Create ${entityLabel}` : 'Save Changes'}
          </Button>
        </div>
      </form>

      <EditPreviewDialog
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        changes={changes}
        onConfirm={actualSubmit}
        isSubmitting={isSubmitting}
      />
    </TooltipProvider>
  );
}
