/**
 * PocketBooks - Application Constants
 *
 * Central repository for all application-wide constants including
 * colors, options, and configuration values.
 */

import {
  EntityStatus,
  TransactionStatus,
  ProcurementStatus,
  SaleStatus,
  PaymentMethod,
  ExpenseCategory,
  UnitOfMeasurement,
  InventoryItemType,
  PartyType,
  AccountType,
} from '@/types';

// ============================================================================
// DESIGN SYSTEM COLORS (from documentation page 12)
// ============================================================================

export const COLORS = {
  primary: '#1e40af', // Blue 800
  secondary: '#3b82f6', // Blue 500
  success: '#10b981', // Green 500
  warning: '#f59e0b', // Amber 500
  error: '#ef4444', // Red 500
  info: '#06b6d4', // Cyan 500
} as const;

// ============================================================================
// STATUS OPTIONS
// ============================================================================

export const ENTITY_STATUS_OPTIONS = [
  { value: EntityStatus.ACTIVE, label: 'Active' },
  { value: EntityStatus.INACTIVE, label: 'Inactive' },
] as const;

export const TRANSACTION_STATUS_OPTIONS = [
  { value: TransactionStatus.PENDING, label: 'Pending' },
  { value: TransactionStatus.COMPLETED, label: 'Completed' },
  { value: TransactionStatus.CANCELLED, label: 'Cancelled' },
] as const;

export const PROCUREMENT_STATUS_OPTIONS = [
  { value: ProcurementStatus.ORDERED, label: 'Ordered' },
  { value: ProcurementStatus.RECEIVED, label: 'Received' },
  { value: ProcurementStatus.CANCELLED, label: 'Cancelled' },
] as const;

export const SALE_STATUS_OPTIONS = [
  { value: SaleStatus.PENDING, label: 'Pending' },
  { value: SaleStatus.COMPLETED, label: 'Completed' },
  { value: SaleStatus.PARTIALLY_PAID, label: 'Partially Paid' },
  { value: SaleStatus.CANCELLED, label: 'Cancelled' },
] as const;

// ============================================================================
// PAYMENT METHOD OPTIONS
// ============================================================================

export const PAYMENT_METHOD_OPTIONS = [
  { value: PaymentMethod.CASH, label: 'Cash' },
  { value: PaymentMethod.BANK_TRANSFER, label: 'Bank Transfer' },
  { value: PaymentMethod.CHEQUE, label: 'Cheque' },
  { value: PaymentMethod.UPI, label: 'UPI' },
  { value: PaymentMethod.CARD, label: 'Card' },
  { value: PaymentMethod.OTHER, label: 'Other' },
] as const;

// ============================================================================
// EXPENSE CATEGORY OPTIONS
// ============================================================================

export const EXPENSE_CATEGORY_OPTIONS = [
  { value: ExpenseCategory.RENT, label: 'Rent' },
  { value: ExpenseCategory.UTILITIES, label: 'Utilities' },
  { value: ExpenseCategory.SALARIES, label: 'Salaries' },
  { value: ExpenseCategory.TRANSPORTATION, label: 'Transportation' },
  { value: ExpenseCategory.OFFICE_SUPPLIES, label: 'Office Supplies' },
  { value: ExpenseCategory.MARKETING, label: 'Marketing' },
  { value: ExpenseCategory.MAINTENANCE, label: 'Maintenance' },
  { value: ExpenseCategory.PROFESSIONAL_FEES, label: 'Professional Fees' },
  { value: ExpenseCategory.INSURANCE, label: 'Insurance' },
  { value: ExpenseCategory.TAXES, label: 'Taxes' },
  { value: ExpenseCategory.INTEREST, label: 'Interest' },
  { value: ExpenseCategory.MISCELLANEOUS, label: 'Miscellaneous' },
] as const;

// ============================================================================
// UNIT OF MEASUREMENT OPTIONS
// ============================================================================

export const UNIT_OPTIONS = [
  { value: UnitOfMeasurement.KG, label: 'Kilogram (kg)' },
  { value: UnitOfMeasurement.GRAM, label: 'Gram (g)' },
  { value: UnitOfMeasurement.LITER, label: 'Liter (L)' },
  { value: UnitOfMeasurement.MILLILITER, label: 'Milliliter (mL)' },
  { value: UnitOfMeasurement.PIECE, label: 'Piece (pc)' },
  { value: UnitOfMeasurement.BOX, label: 'Box' },
  { value: UnitOfMeasurement.CARTON, label: 'Carton' },
  { value: UnitOfMeasurement.METER, label: 'Meter (m)' },
  { value: UnitOfMeasurement.CENTIMETER, label: 'Centimeter (cm)' },
  { value: UnitOfMeasurement.SQUARE_METER, label: 'Square Meter (m²)' },
  { value: UnitOfMeasurement.CUBIC_METER, label: 'Cubic Meter (m³)' },
  { value: UnitOfMeasurement.DOZEN, label: 'Dozen' },
  { value: UnitOfMeasurement.PACKET, label: 'Packet' },
  { value: UnitOfMeasurement.BAG, label: 'Bag' },
  { value: UnitOfMeasurement.OTHER, label: 'Other' },
] as const;

// ============================================================================
// INVENTORY TYPE OPTIONS
// ============================================================================

export const INVENTORY_TYPE_OPTIONS = [
  { value: InventoryItemType.RAW_MATERIAL, label: 'Raw Material' },
  { value: InventoryItemType.TRADING_GOOD, label: 'Trading Good' },
  { value: InventoryItemType.FINISHED_GOOD, label: 'Finished Good' },
] as const;

// ============================================================================
// PARTY TYPE OPTIONS
// ============================================================================

export const PARTY_TYPE_OPTIONS = [
  { value: PartyType.CLIENT, label: 'Client' },
  { value: PartyType.VENDOR, label: 'Vendor' },
] as const;

// ============================================================================
// ACCOUNT TYPE OPTIONS
// ============================================================================

export const ACCOUNT_TYPE_OPTIONS = [
  { value: AccountType.RECEIVABLE, label: 'Receivable' },
  { value: AccountType.PAYABLE, label: 'Payable' },
] as const;

// ============================================================================
// PAGINATION DEFAULTS
// ============================================================================

export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

// ============================================================================
// DATE FORMATS
// ============================================================================

export const DATE_FORMAT = 'MMM dd, yyyy';
export const DATE_TIME_FORMAT = 'MMM dd, yyyy hh:mm a';
export const INPUT_DATE_FORMAT = 'yyyy-MM-dd';

// ============================================================================
// CURRENCY
// ============================================================================

export const DEFAULT_CURRENCY = 'INR';
export const CURRENCY_SYMBOL = '₹';

// ============================================================================
// GST RATES
// ============================================================================

export const GST_RATE_OPTIONS = [
  { value: 0, label: '0%' },
  { value: 5, label: '5%' },
  { value: 12, label: '12%' },
  { value: 18, label: '18%' },
  { value: 28, label: '28%' },
] as const;

// ============================================================================
// VALIDATION RULES
// ============================================================================

export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^[6-9]\d{9}$/,
  GST_REGEX: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
  PAN_REGEX: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
  MIN_PASSWORD_LENGTH: 8,
  MAX_NAME_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 500,
} as const;

// ============================================================================
// STATUS COLORS FOR UI
// ============================================================================

export const STATUS_COLORS: Record<string, string> = {
  'active': 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  'inactive': 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  'pending': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  'completed': 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  'cancelled': 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  'ordered': 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  'received': 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  'partially_paid': 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
};

// ============================================================================
// NAVIGATION ITEMS (complementing sidebar)
// ============================================================================

export const BREADCRUMB_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  clients: 'Clients',
  vendors: 'Vendors',
  inventory: 'Inventory',
  'raw-materials': 'Raw Materials',
  'trading-goods': 'Trading Goods',
  'finished-goods': 'Finished Goods',
  procurement: 'Procurement',
  sales: 'Sales',
  payments: 'Payments',
  expenses: 'Expenses',
  'interest-payments': 'Interest Payments',
  analytics: 'Analytics',
  'accounts-receivable': 'Accounts Receivable',
  'accounts-payable': 'Accounts Payable',
  'profit-loss': 'Profit & Loss',
  settings: 'Settings',
  new: 'New',
} as const;
