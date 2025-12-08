'use client';

import { IClient } from '@/types';
import { MetricCardsRow } from './metric-cards-row';
import { PaymentHistoryEmpty } from './payment-history-empty';

interface FinancialTabProps {
  client: IClient;
}

export function FinancialTab({ client }: FinancialTabProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Metric Cards Row */}
      <MetricCardsRow client={client} />

      {/* Payment History Section */}
      <div className="rounded-lg border border-border bg-card p-4 sm:p-6 transition-colors duration-200">
        <h3 className="font-semibold text-foreground mb-4">Payment History</h3>
        <PaymentHistoryEmpty />
      </div>
    </div>
  );
}
