/**
 * Enhanced Client Form Component
 *
 * Modern form for creating and editing clients with advanced features:
 * - Visual feedback and real-time validation
 * - Avatar preview
 * - Better UX with tooltips and help text
 * - Auto-formatting for phone and GST numbers
 * - Modern shadcn/ui components
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Loader2,
  Save,
  X,
  Building2,
  Mail,
  Phone,
  MapPin,
  FileText,
  User,
  CheckCircle2,
  AlertCircle,
  Info,
} from 'lucide-react';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
import { fadeInUp, staggerContainer } from '@/lib/utils/animation-variants';

interface ClientFormProps {
  mode: 'create' | 'edit';
  clientId?: string;
  initialData?: IClient;
}

type FormData = IClientInput;
type FormErrors = Partial<Record<keyof FormData | 'submit', string>>;

// Helper functions matching list view patterns
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const getAvatarColor = (name: string) => {
  const colors = [
    'bg-blue-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-green-500',
    'bg-orange-500',
    'bg-cyan-500',
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

export function ClientFormEnhanced({ mode, clientId, initialData }: ClientFormProps) {
  const router = useRouter();
  const [errors, setErrors] = useState<FormErrors>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Use React Query mutations
  const createClientMutation = useCreateClient();
  const updateClientMutation = useUpdateClient();

  // Compute isSubmitting from mutation states
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

  // Track unsaved changes
  useEffect(() => {
    const hasChanges = JSON.stringify(formData) !== JSON.stringify({
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
    setHasUnsavedChanges(hasChanges);
  }, [formData, initialData]);

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

  const validateField = (field: keyof FormData, value: FormData[keyof FormData]): string | null => {
    switch (field) {
      case 'name':
        if (typeof value === 'string') {
          if (!value?.trim()) return 'Client name is required';
          if (value.length > 100) return 'Name cannot exceed 100 characters';
        }
        break;
      case 'email':
        if (typeof value === 'string') {
          if (!value?.trim()) return 'Email is required';
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please provide a valid email address';
        }
        break;
      case 'phone':
        if (typeof value === 'string' && value && !/^[6-9]\d{9}$/.test(value.replace(/\D/g, '')))
          return 'Please provide a valid 10-digit Indian phone number';
        break;
      case 'gstNumber':
        if (typeof value === 'string' && value && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(value))
          return 'Please provide a valid GST number';
        break;
      case 'contactPerson':
        if (typeof value === 'string' && value && value.length > 100)
          return 'Contact person name cannot exceed 100 characters';
        break;
    }
    return null;
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    Object.keys(formData).forEach((key) => {
      const field = key as keyof FormData;
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Validation failed', {
        description: 'Please fix the errors in the form',
      });
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
        // Navigation handled - cache automatically updated
        router.push(`/clients/${response.data?._id}`);
      } else if (mode === 'edit' && clientId) {
        await updateClientMutation.mutateAsync({ id: clientId, input: submitData });
        // Navigation handled - cache automatically updated
        router.push(`/clients/${clientId}`);
      }

      setHasUnsavedChanges(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : `Failed to ${mode} client`;
      setErrors({ submit: message });
      // Toast is handled by the mutation hooks
    }
  };

  const updateFormField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setTouchedFields((prev) => new Set(prev).add(field));

    // Real-time validation for touched fields
    const error = validateField(field, value);
    setErrors((prev) => ({ ...prev, [field]: error || undefined }));
  };

  const updateAddressField = (field: keyof NonNullable<FormData['address']>, value: string) => {
    setFormData((prev) => ({
      ...prev,
      address: { ...prev.address, [field]: value },
    }));
  };

  // Auto-format phone number
  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, '');
    return digits.slice(0, 10);
  };

  // Auto-format GST number
  const formatGSTNumber = (value: string) => {
    return value.toUpperCase().slice(0, 15);
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      if (confirm('You have unsaved changes. Are you sure you want to leave?')) {
        router.back();
      }
    } else {
      router.back();
    }
  };

  const getFieldStatus = (field: keyof FormData) => {
    const isTouched = touchedFields.has(field);
    const hasError = !!errors[field];
    const value = formData[field];
    const hasValue = typeof value === 'string' ? value.trim() !== '' : !!value;

    if (!isTouched) return null;
    if (hasError) return 'error';
    if (hasValue) return 'success';
    return null;
  };

  const FieldStatusIcon = ({ field }: { field: keyof FormData }) => {
    const status = getFieldStatus(field);
    if (!status) return null;

    return status === 'error' ? (
      <AlertCircle className="h-4 w-4 text-destructive" />
    ) : (
      <CheckCircle2 className="h-4 w-4 text-green-500" />
    );
  };

  return (
    <TooltipProvider>
      <motion.form
        onSubmit={handleSubmit}
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Avatar Preview Card */}
        {formData.name && (
          <motion.div variants={fadeInUp}>
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 border-2 border-background shadow-lg">
                    <AvatarFallback
                      className={cn('text-white text-xl font-semibold', getAvatarColor(formData.name))}
                    >
                      {getInitials(formData.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{formData.name}</h3>
                    {formData.contactPerson && (
                      <p className="text-sm text-muted-foreground">{formData.contactPerson}</p>
                    )}
                    <div className="mt-1 flex items-center gap-2">
                      <Badge variant={formData.status === EntityStatus.ACTIVE ? 'default' : 'secondary'}>
                        {formData.status}
                      </Badge>
                      {hasUnsavedChanges && (
                        <Badge variant="outline" className="text-orange-600">
                          Unsaved changes
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Basic Information */}
        <motion.div variants={fadeInUp}>
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>Enter the client&apos;s basic contact details</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Client Name */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="name" className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      Client Name
                      <span className="text-destructive">*</span>
                    </Label>
                    <FieldStatusIcon field="name" />
                  </div>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => updateFormField('name', e.target.value)}
                    onBlur={() => setTouchedFields((prev) => new Set(prev).add('name'))}
                    placeholder="e.g., Acme Corporation"
                    required
                    disabled={isSubmitting}
                    className={cn(
                      errors.name && 'border-destructive',
                      getFieldStatus('name') === 'success' && 'border-green-500'
                    )}
                  />
                  {errors.name && (
                    <p className="flex items-center gap-1 text-sm text-destructive">
                      <AlertCircle className="h-3 w-3" />
                      {errors.name}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {formData.name.length}/100 characters
                  </p>
                </div>

                {/* Contact Person */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="contactPerson" className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
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
                    <FieldStatusIcon field="contactPerson" />
                  </div>
                  <Input
                    id="contactPerson"
                    value={formData.contactPerson}
                    onChange={(e) => updateFormField('contactPerson', e.target.value)}
                    onBlur={() => setTouchedFields((prev) => new Set(prev).add('contactPerson'))}
                    placeholder="e.g., John Doe"
                    disabled={isSubmitting}
                  />
                  {formData.contactPerson && (
                    <p className="text-xs text-muted-foreground">
                      {formData.contactPerson.length}/100 characters
                    </p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Email */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      Email
                      <span className="text-destructive">*</span>
                    </Label>
                    <FieldStatusIcon field="email" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormField('email', e.target.value)}
                    onBlur={() => setTouchedFields((prev) => new Set(prev).add('email'))}
                    placeholder="client@example.com"
                    required
                    disabled={isSubmitting}
                    className={cn(
                      errors.email && 'border-destructive',
                      getFieldStatus('email') === 'success' && 'border-green-500'
                    )}
                  />
                  {errors.email && (
                    <p className="flex items-center gap-1 text-sm text-destructive">
                      <AlertCircle className="h-3 w-3" />
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      Phone
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>10-digit Indian phone number starting with 6-9</p>
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                    <FieldStatusIcon field="phone" />
                  </div>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateFormField('phone', formatPhoneNumber(e.target.value))}
                    onBlur={() => setTouchedFields((prev) => new Set(prev).add('phone'))}
                    placeholder="9876543210"
                    disabled={isSubmitting}
                    className={cn(
                      errors.phone && 'border-destructive',
                      getFieldStatus('phone') === 'success' && 'border-green-500'
                    )}
                  />
                  {errors.phone && (
                    <p className="flex items-center gap-1 text-sm text-destructive">
                      <AlertCircle className="h-3 w-3" />
                      {errors.phone}
                    </p>
                  )}
                  {formData.phone && !errors.phone && (
                    <p className="text-xs text-green-600">+91 {formData.phone}</p>
                  )}
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 sm:grid-cols-2">
                {/* GST Number */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="gstNumber" className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      GST Number
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Format: 22AAAAA0000A1Z5 (15 characters)</p>
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                    <FieldStatusIcon field="gstNumber" />
                  </div>
                  <Input
                    id="gstNumber"
                    value={formData.gstNumber}
                    onChange={(e) => updateFormField('gstNumber', formatGSTNumber(e.target.value))}
                    onBlur={() => setTouchedFields((prev) => new Set(prev).add('gstNumber'))}
                    placeholder="22AAAAA0000A1Z5"
                    disabled={isSubmitting}
                    className={cn(
                      'font-mono',
                      errors.gstNumber && 'border-destructive',
                      getFieldStatus('gstNumber') === 'success' && 'border-green-500'
                    )}
                  />
                  {errors.gstNumber && (
                    <p className="flex items-center gap-1 text-sm text-destructive">
                      <AlertCircle className="h-3 w-3" />
                      {errors.gstNumber}
                    </p>
                  )}
                  {formData.gstNumber && (
                    <p className="text-xs text-muted-foreground">{formData.gstNumber.length}/15 characters</p>
                  )}
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
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
                          <div className="h-2 w-2 rounded-full bg-green-500" />
                          Active
                        </div>
                      </SelectItem>
                      <SelectItem value={EntityStatus.INACTIVE}>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-gray-500" />
                          Inactive
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Address Information */}
        <motion.div variants={fadeInUp}>
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-primary/10 p-2">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Address Information</CardTitle>
                  <CardDescription>Enter the client&apos;s address details</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="street">Street Address</Label>
                <Textarea
                  id="street"
                  value={formData.address?.street}
                  onChange={(e) => updateAddressField('street', e.target.value)}
                  placeholder="Building number, street name, area"
                  disabled={isSubmitting}
                  rows={2}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.address?.city}
                    onChange={(e) => updateAddressField('city', e.target.value)}
                    placeholder="e.g., Mumbai"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={formData.address?.state}
                    onChange={(e) => updateAddressField('state', e.target.value)}
                    placeholder="e.g., Maharashtra"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    value={formData.address?.postalCode}
                    onChange={(e) => updateAddressField('postalCode', e.target.value)}
                    placeholder="e.g., 400001"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={formData.address?.country}
                    onChange={(e) => updateAddressField('country', e.target.value)}
                    placeholder="India"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Submit Error */}
        {errors.submit && (
          <motion.div variants={fadeInUp}>
            <Card className="border-destructive bg-destructive/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  <p className="text-sm text-destructive">{errors.submit}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Form Actions */}
        <motion.div variants={fadeInUp} className="flex items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            <kbd className="rounded bg-muted px-2 py-1 text-xs">Ctrl</kbd> +{' '}
            <kbd className="rounded bg-muted px-2 py-1 text-xs">S</kbd> to save
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
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
        </motion.div>
      </motion.form>
    </TooltipProvider>
  );
}
