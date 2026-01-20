/**
 * PocketBooks - TypeScript Type Definitions
 *
 * Comprehensive type definitions for all entities and operations
 * in the PocketBooks business tracking application.
 */

import { Types } from 'mongoose';

// ============================================================================
// ENUMS AND CONSTANTS
// ============================================================================

export enum EntityStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum ProcurementStatus {
  ORDERED = 'ordered',
  RECEIVED = 'received',
  PARTIALLY_RECEIVED = 'partially_received',
  RETURNED = 'returned',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

export enum SaleStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  PARTIALLY_PAID = 'partially_paid',
}

export enum PaymentStatus {
  UNPAID = 'unpaid',
  PARTIALLY_PAID = 'partially_paid',
  FULLY_PAID = 'fully_paid',
}

export enum PaymentMethod {
  CASH = 'cash',
  BANK_TRANSFER = 'bank_transfer',
  CHEQUE = 'cheque',
  UPI = 'upi',
  CARD = 'card',
  OTHER = 'other',
}

export enum TransactionType {
  SALE = 'sale',
  PURCHASE = 'purchase',
  EXPENSE = 'expense',
}

export enum AccountType {
  RECEIVABLE = 'receivable',
  PAYABLE = 'payable',
}

export enum PartyType {
  CLIENT = 'client',
  VENDOR = 'vendor',
}

export enum ExpenseCategory {
  RENT = 'rent',
  UTILITIES = 'utilities',
  SALARIES = 'salaries',
  TRANSPORTATION = 'transportation',
  OFFICE_SUPPLIES = 'office_supplies',
  MARKETING = 'marketing',
  MAINTENANCE = 'maintenance',
  PROFESSIONAL_FEES = 'professional_fees',
  INSURANCE = 'insurance',
  TAXES = 'taxes',
  INTEREST = 'interest',
  MISCELLANEOUS = 'miscellaneous',
}

export enum AssetCategory {
  ELECTRONICS = 'electronics',
  FURNITURE = 'furniture',
  MACHINERY = 'machinery',
  VEHICLE = 'vehicle',
  OFFICE_EQUIPMENT = 'office_equipment',
  OTHER = 'other',
}

export enum AssetStatus {
  ACTIVE = 'active',
  REPAIR = 'repair',
  RETIRED = 'retired',
  DISPOSED = 'disposed',
}

export enum UnitOfMeasurement {
  KG = 'kg',
  GRAM = 'gram',
  LITER = 'liter',
  MILLILITER = 'milliliter',
  PIECE = 'piece',
  BOX = 'box',
  CARTON = 'carton',
  METER = 'meter',
  CENTIMETER = 'centimeter',
  SQUARE_METER = 'square_meter',
  CUBIC_METER = 'cubic_meter',
  DOZEN = 'dozen',
  PACKET = 'packet',
  BAG = 'bag',
  OTHER = 'other',
}

export enum InventoryItemType {
  RAW_MATERIAL = 'RawMaterial',
  TRADING_GOOD = 'TradingGood',
  FINISHED_GOOD = 'FinishedGood',
}

// ============================================================================
// SETTINGS ENTITIES
// ============================================================================

export interface IRawMaterialType {
  _id: Types.ObjectId | string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRawMaterialTypeInput {
  name: string;
  description?: string;
  isActive?: boolean;
}

// ============================================================================
// CLIENT ENTITY
// ============================================================================

export interface IClient {
  _id: Types.ObjectId | string;
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
  status: EntityStatus;
  gstNumber?: string;
  outstandingBalance: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IClientInput {
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

// ============================================================================
// VENDOR ENTITY
// ============================================================================

export interface IVendor {
  _id: Types.ObjectId | string;
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
  specialty?: string;
  rawMaterialTypes?: string[];
  status: EntityStatus;
  gstNumber?: string;
  outstandingPayable: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IVendorInput {
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
  specialty?: string;
  rawMaterialTypes?: string[];
  status?: EntityStatus;
  gstNumber?: string;
}

// ============================================================================
// INVENTORY ENTITIES
// ============================================================================

export interface IRawMaterial {
  _id: Types.ObjectId | string;
  name: string;
  unit: UnitOfMeasurement;
  currentStock: number;
  reorderLevel: number;
  intendedFor?: string;
  costPrice: number;
  lastProcurementDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRawMaterialInput {
  name: string;
  unit: UnitOfMeasurement;
  currentStock?: number;
  reorderLevel: number;
  intendedFor?: string;
  costPrice: number;
}

export interface ITradingGood {
  _id: Types.ObjectId | string;
  name: string;
  sku?: string;
  unit: UnitOfMeasurement;
  currentStock: number;
  reorderLevel: number;
  costPrice: number;
  sellingPrice: number;
  lastProcurementDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITradingGoodInput {
  name: string;
  sku?: string;
  unit: UnitOfMeasurement;
  currentStock?: number;
  reorderLevel: number;
  costPrice: number;
  sellingPrice: number;
}

export interface IFinishedGood {
  _id: Types.ObjectId | string;
  name: string;
  sku?: string;
  unit: UnitOfMeasurement;
  currentStock: number;
  reorderLevel: number;
  bom: {
    rawMaterialId: Types.ObjectId | string | IRawMaterial;
    quantity: number;
    _id?: string;
  }[];
  sellingPrice: number;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// PROCUREMENT ENTITIES
// ============================================================================

export interface IRawMaterialProcurement {
  _id: Types.ObjectId | string;
  vendorId: Types.ObjectId | string;
  procurementDate: Date;
  items: {
    rawMaterialId: Types.ObjectId | string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }[];
  totalAmount: number;
  gstAmount: number;
  grandTotal: number;
  status: ProcurementStatus;
  invoiceNumber?: string;
  notes?: string;
  receivedDate?: Date;

  // Enhanced fields
  originalPrice: number;
  gstBillPrice: number;
  gstPercentage: number;
  paymentStatus: PaymentStatus;
  totalPaid: number;
  remainingAmount: number;
  paymentTerms?: string;
  expectedDeliveryDate?: Date;
  actualDeliveryDate?: Date;

  createdAt: Date;
  updatedAt: Date;
}

export interface IRawMaterialProcurementInput {
  vendorId: string;
  procurementDate: Date;
  items: {
    rawMaterialId: string;
    quantity: number;
    unitPrice: number;
  }[];
  gstAmount?: number;
  status?: ProcurementStatus;
  invoiceNumber?: string;
  notes?: string;

  // Enhanced fields
  gstPercentage?: number;
  paymentTerms?: string;
  expectedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
}

export interface ITradingGoodsProcurement {
  _id: Types.ObjectId | string;
  vendorId: Types.ObjectId | string;
  procurementDate: Date;
  items: {
    tradingGoodId: Types.ObjectId | string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }[];
  totalAmount: number;
  gstAmount: number;
  grandTotal: number;
  status: ProcurementStatus;
  invoiceNumber?: string;
  notes?: string;
  receivedDate?: Date;

  // Enhanced fields
  originalPrice: number;
  gstBillPrice: number;
  gstPercentage: number;
  paymentStatus: PaymentStatus;
  totalPaid: number;
  remainingAmount: number;
  paymentTerms?: string;
  expectedDeliveryDate?: Date;
  actualDeliveryDate?: Date;

  createdAt: Date;
  updatedAt: Date;
}

export interface ITradingGoodsProcurementInput {
  vendorId: string;
  procurementDate: Date;
  items: {
    tradingGoodId: string;
    quantity: number;
    unitPrice: number;
  }[];
  gstAmount?: number;
  status?: ProcurementStatus;
  invoiceNumber?: string;
  notes?: string;

  // Enhanced fields
  gstPercentage?: number;
  paymentTerms?: string;
  expectedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
}

// ============================================================================
// SALE ENTITY
// ============================================================================

export interface ISaleItem {
  itemId: Types.ObjectId | string;
  itemType: InventoryItemType;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface ISale {
  _id: Types.ObjectId | string;
  clientId: Types.ObjectId | string;
  saleDate: Date;
  items: ISaleItem[];
  subtotal: number;
  discount: number;
  gstAmount: number;
  grandTotal: number;
  paidAmount: number;
  balanceAmount: number;
  status: SaleStatus;
  invoiceNumber: string;
  deliveryDate?: Date;
  notes?: string;

  // Enhanced pricing fields
  originalPrice: number;
  gstBillPrice: number;
  gstPercentage: number;

  // Payment tracking fields
  paymentStatus: PaymentStatus;
  totalPaid: number;
  remainingAmount: number;
  paymentTerms?: string;
  expectedDeliveryDate?: Date;
  actualDeliveryDate?: Date;

  createdAt: Date;
  updatedAt: Date;
}

export interface ISaleInput {
  clientId: string;
  saleDate: Date;
  invoiceNumber?: string;
  items: {
    itemId: string;
    itemType: InventoryItemType;
    quantity: number;
    unitPrice: number;
  }[];
  discount?: number;
  gstAmount?: number;
  deliveryDate?: Date;
  notes?: string;

  // Enhanced fields
  gstPercentage?: number;
  paymentTerms?: string;
  expectedDeliveryDate?: Date;
  actualDeliveryDate?: Date;

  // Initial payment for atomic sale+payment creation
  initialPayment?: {
    amount: number;
    paymentMethod: PaymentMethod;
    paymentDate?: Date;
    notes?: string;
  };
}

// ============================================================================
// PAYMENT ENTITY
// ============================================================================

export interface IPayment {
  _id: Types.ObjectId | string;
  paymentDate: Date;
  amount: number;
  paymentMethod: PaymentMethod;
  transactionType: TransactionType;
  transactionId?: string;
  accountType: AccountType;
  partyId?: Types.ObjectId | string;
  partyType?: PartyType;
  saleId?: Types.ObjectId | string;
  procurementId?: Types.ObjectId | string;
  assetId?: Types.ObjectId | string;
  expenseId?: Types.ObjectId | string;
  notes?: string;

  // Enhanced fields
  procurementType?: 'raw_material' | 'trading_good';
  trancheNumber?: number;
  totalTranches?: number;
  referenceNumber?: string;

  createdAt: Date;
  updatedAt: Date;
}

export interface IPaymentInput {
  paymentDate: Date;
  amount: number;
  paymentMethod: PaymentMethod;
  transactionType: TransactionType;
  transactionId?: string;
  accountType: AccountType;
  partyId?: string;
  partyType?: PartyType;
  saleId?: string;
  procurementId?: string;
  assetId?: string;
  expenseId?: string;
  notes?: string;
}

// ============================================================================
// EXPENSE ENTITY
// ============================================================================

export interface IExpense {
  _id: Types.ObjectId | string;
  date: Date;
  category: ExpenseCategory;
  description: string;
  amount: number;
  paymentMethod: PaymentMethod;
  receiptNumber?: string;
  notes?: string;
  paymentId?: Types.ObjectId | string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IExpenseInput {
  date: Date;
  category: ExpenseCategory;
  description: string;
  amount: number;
  paymentMethod: PaymentMethod;
  receiptNumber?: string;
  notes?: string;
}

// ============================================================================
// ASSET ENTITY
// ============================================================================

export interface IAsset {
  _id: Types.ObjectId | string;
  name: string;
  description?: string;
  category: AssetCategory;
  serialNumber?: string;
  purchaseDate: Date;
  purchasePrice: number;
  currentValue: number;
  location?: string;
  vendorId?: Types.ObjectId | string;
  status: AssetStatus;
  gstEnabled?: boolean;
  gstPercentage?: number;
  gstAmount?: number;
  paymentId?: Types.ObjectId | string;
  paymentDetails?: {
    amount: number;
    paymentMethod: PaymentMethod;
    paymentDate: Date;
    notes?: string;
  };
  paymentStatus: 'unpaid' | 'partially_paid' | 'fully_paid';
  totalPaid: number;
  remainingAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAssetInput {
  name: string;
  description?: string;
  category: AssetCategory;
  serialNumber?: string;
  purchaseDate: Date;
  purchasePrice: number;
  currentValue?: number;
  location?: string;
  vendorId?: string;
  status?: AssetStatus;
  gstEnabled?: boolean;
  gstPercentage?: number;
  gstAmount?: number;
  paymentDetails?: {
    amount: number;
    paymentMethod: PaymentMethod;
    paymentDate: Date;
    notes?: string;
  };
  paymentStatus?: 'unpaid' | 'partially_paid' | 'fully_paid';
}

// ============================================================================
// LOAN ACCOUNT ENTITY
// ============================================================================

export enum LoanAccountStatus {
  ACTIVE = 'active',
  CLOSED = 'closed',
  DEFAULTED = 'defaulted',
}

export interface ILoanAccount {
  _id: Types.ObjectId | string;
  bankName: string;
  accountNumber: string;
  loanType: string;
  principalAmount: number;
  interestRate: number;
  startDate: Date;
  endDate?: Date;
  emiAmount?: number;
  totalInterestPaid: number;
  totalPrincipalPaid: number;
  outstandingAmount: number;
  status: LoanAccountStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILoanAccountInput {
  bankName: string;
  accountNumber: string;
  loanType: string;
  principalAmount: number;
  interestRate: number;
  startDate: Date;
  endDate?: Date;
  emiAmount?: number;
  status?: LoanAccountStatus;
  notes?: string;
}

// ============================================================================
// INTEREST PAYMENT ENTITY
// ============================================================================

export interface IInterestPayment {
  _id: Types.ObjectId | string;
  loanAccountId: Types.ObjectId | string;
  date: Date;
  principalAmount: number;
  interestAmount: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  expenseId?: Types.ObjectId | string;
  paymentId?: Types.ObjectId | string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IInterestPaymentInput {
  loanAccountId: string;
  date: Date;
  principalAmount: number;
  interestAmount: number;
  paymentMethod: PaymentMethod;
  notes?: string;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  startDate?: string;
  endDate?: string;
  assetId?: string;
  transactionType?: string;
  partyType?: string;
  loanAccountId?: string;
}

// ============================================================================
// ANALYTICS TYPES
// ============================================================================

export interface SalesAnalytics {
  totalRevenue: number;
  totalSales: number;
  averageOrderValue: number;
  topClients: {
    clientId: string;
    clientName: string;
    totalSales: number;
  }[];
  salesByMonth: {
    month: string;
    revenue: number;
    count: number;
  }[];
  salesByProduct: {
    productId: string;
    productName: string;
    quantity: number;
    revenue: number;
  }[];
}

export interface AccountsReceivableReport {
  totalOutstanding: number;
  overdueAmount: number;
  currentAmount: number;
  clients: {
    clientId: string;
    clientName: string;
    outstanding: number;
    overdue: number;
    lastPaymentDate?: Date;
  }[];
}

export interface AccountsPayableReport {
  totalOutstanding: number;
  overdueAmount: number;
  currentAmount: number;
  vendors: {
    vendorId: string;
    vendorName: string;
    outstanding: number;
    overdue: number;
    lastPaymentDate?: Date;
  }[];
}

export interface ProfitLossStatement {
  revenue: {
    sales: number;
    total: number;
  };
  costOfGoodsSold: {
    rawMaterials: number;
    tradingGoods: number;
    manufacturing: number;
    total: number;
  };
  grossProfit: number;
  expenses: {
    category: ExpenseCategory;
    amount: number;
  }[];
  totalExpenses: number;
  operatingProfit: number;
  interestExpense: number;
  netProfit: number;
  profitMargin: number;
}

export interface DashboardMetrics {
  totalSales: number;
  pendingReceivables: number;
  pendingPayables: number;
  netProfit: number;
  salesChange: number;
  arChange: number;
  apChange: number;
  profitChange: number;
  lowStockItems: {
    itemId: string;
    itemName: string;
    itemType: InventoryItemType;
    currentStock: number;
    reorderLevel: number;
    unit: UnitOfMeasurement;
  }[];
  recentSales: ISale[];
  pendingPayments: {
    clientId: string;
    clientName: string;
    amount: number;
    dueDate: Date;
    invoiceNumber: string;
  }[];
}
