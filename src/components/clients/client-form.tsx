/**
 * Client Form Component
 *
 * Form for creating and editing clients with validation
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Save } from 'lucide-react';
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { createClient, updateClient } from '@/lib/api/clients';
import { IClient, IClientInput, EntityStatus } from '@/types';
import { toast } from 'sonner';

interface ClientFormProps {
  mode: 'create' | 'edit';
  clientId?: string;
  initialData?: IClient;
}

type FormData = IClientInput;
type FormErrors = Partial<Record<keyof FormData | 'submit', string>>;

export function ClientForm({ mode, clientId, initialData }: ClientFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

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

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Required fields
    if (!formData.name.trim()) {
      newErrors.name = 'Client name is required';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Name cannot exceed 100 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please provide a valid email address';
    }

    // Optional field validations
    if (formData.phone && !/^[6-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = 'Please provide a valid 10-digit Indian phone number';
    }

    if (
      formData.gstNumber &&
      !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(
        formData.gstNumber
      )
    ) {
      newErrors.gstNumber = 'Please provide a valid GST number';
    }

    if (formData.contactPerson && formData.contactPerson.length > 100) {
      newErrors.contactPerson = 'Contact person name cannot exceed 100 characters';
    }

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

    setIsSubmitting(true);
    setErrors({});

    try {
      // Clean up form data
      const submitData: IClientInput = {
        ...formData,
        phone: formData.phone?.trim() || undefined,
        contactPerson: formData.contactPerson?.trim() || undefined,
        gstNumber: formData.gstNumber?.trim() || undefined,
      };

      if (mode === 'create') {
        const response = await createClient(submitData);
        toast.success('Client created', {
          description: `${formData.name} has been successfully created.`,
        });
        router.push(`/clients/${response.data?._id}`);
      } else if (mode === 'edit' && clientId) {
        await updateClient(clientId, submitData);
        toast.success('Client updated', {
          description: `${formData.name} has been successfully updated.`,
        });
        router.push(`/clients/${clientId}`);
      }

      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : `Failed to ${mode} client`;

      setErrors({ submit: message });

      toast.error(`${mode === 'create' ? 'Create' : 'Update'} failed`, {
        description: message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormField = <K extends keyof FormData>(
    field: K,
    value: FormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            Enter the client's basic contact details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">
                Client Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateFormField('name', e.target.value)}
                placeholder="Enter client name"
                required
                disabled={isSubmitting}
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? 'name-error' : undefined}
              />
              {errors.name && (
                <p id="name-error" className="text-sm text-destructive">
                  {errors.name}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactPerson">Contact Person</Label>
              <Input
                id="contactPerson"
                value={formData.contactPerson}
                onChange={(e) => updateFormField('contactPerson', e.target.value)}
                placeholder="Enter contact person name"
                disabled={isSubmitting}
                aria-invalid={!!errors.contactPerson}
              />
              {errors.contactPerson && (
                <p className="text-sm text-destructive">{errors.contactPerson}</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">
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
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => updateFormField('phone', e.target.value)}
                placeholder="9876543210"
                disabled={isSubmitting}
                aria-invalid={!!errors.phone}
              />
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone}</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="gstNumber">GST Number</Label>
              <Input
                id="gstNumber"
                value={formData.gstNumber}
                onChange={(e) =>
                  updateFormField('gstNumber', e.target.value.toUpperCase())
                }
                placeholder="22AAAAA0000A1Z5"
                disabled={isSubmitting}
                aria-invalid={!!errors.gstNumber}
              />
              {errors.gstNumber && (
                <p className="text-sm text-destructive">{errors.gstNumber}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  updateFormField('status', value as EntityStatus)
                }
                disabled={isSubmitting}
              >
                <SelectTrigger id="status">
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

      {/* Address Information */}
      <Card>
        <CardHeader>
          <CardTitle>Address Information</CardTitle>
          <CardDescription>Enter the client's address details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="street">Street Address</Label>
            <Textarea
              id="street"
              value={formData.address?.street}
              onChange={(e) => updateAddressField('street', e.target.value)}
              placeholder="Enter street address"
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
                placeholder="Enter city"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={formData.address?.state}
                onChange={(e) => updateAddressField('state', e.target.value)}
                placeholder="Enter state"
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
                placeholder="Enter postal code"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.address?.country}
                onChange={(e) => updateAddressField('country', e.target.value)}
                placeholder="Enter country"
                disabled={isSubmitting}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit Error */}
      {errors.submit && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-sm text-destructive">{errors.submit}</p>
          </CardContent>
        </Card>
      )}

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
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
    </form>
  );
}
