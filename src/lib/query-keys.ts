/**
 * Shared Query Keys
 *
 * Centralized query key definitions to ensure consistency across hooks
 * and avoid circular dependencies between use-assets.ts and use-payments.ts
 *
 * This resolves Implementation Gap G4: Cross-module cache invalidation consistency
 */

// Base query key constants
export const ASSETS_QUERY_KEY = 'assets';
export const PAYMENTS_QUERY_KEY = 'payments';
export const VENDORS_QUERY_KEY = 'vendors';
export const CLIENTS_QUERY_KEY = 'clients';
export const EXPENSES_QUERY_KEY = 'expenses';

/**
 * Structured query keys for Assets
 */
export const assetKeys = {
    all: [ASSETS_QUERY_KEY] as const,
    lists: () => [...assetKeys.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...assetKeys.lists(), filters] as const,
    details: () => [...assetKeys.all, 'detail'] as const,
    detail: (id: string) => [...assetKeys.details(), id] as const,
};

/**
 * Structured query keys for Payments
 */
export const paymentKeys = {
    all: [PAYMENTS_QUERY_KEY] as const,
    lists: () => [...paymentKeys.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...paymentKeys.lists(), filters] as const,
    details: () => [...paymentKeys.all, 'detail'] as const,
    detail: (id: string) => [...paymentKeys.details(), id] as const,
    stats: () => [...paymentKeys.all, 'stats'] as const,
};

/**
 * Structured query keys for Vendors
 */
export const vendorKeys = {
    all: [VENDORS_QUERY_KEY] as const,
    lists: () => [...vendorKeys.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...vendorKeys.lists(), filters] as const,
    details: () => [...vendorKeys.all, 'detail'] as const,
    detail: (id: string) => [...vendorKeys.details(), id] as const,
};

/**
 * Structured query keys for Clients
 */
export const clientKeys = {
    all: [CLIENTS_QUERY_KEY] as const,
    lists: () => [...clientKeys.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...clientKeys.lists(), filters] as const,
    details: () => [...clientKeys.all, 'detail'] as const,
    detail: (id: string) => [...clientKeys.details(), id] as const,
};

/**
 * Structured query keys for Expenses
 */
export const expenseKeys = {
    all: [EXPENSES_QUERY_KEY] as const,
    lists: () => [...expenseKeys.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...expenseKeys.lists(), filters] as const,
    details: () => [...expenseKeys.all, 'detail'] as const,
    detail: (id: string) => [...expenseKeys.details(), id] as const,
    stats: () => [...expenseKeys.all, 'stats'] as const,
};
