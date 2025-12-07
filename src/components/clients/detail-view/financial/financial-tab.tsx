'use client';

import { IClient } from '@/types';
import { MetricCardsRow } from './metric-cards-row';
import { PaymentHistoryEmpty } from './payment-history-empty';

interface FinancialTabProps {
  client: IClient;
}

export function FinancialTab({ client }: FinancialTabProps) {
  return (
    <div className="space-y-6">
      {/* Metric Cards Row */}
      <MetricCardsRow client={client} />

      {/* Payment History Section */}
      <div className="saas-card p-6">
        <h3 className="font-semibold text-[var(--saas-heading)] mb-4">Payment History</h3>
        <PaymentHistoryEmpty />
      </div>
    </div>
  );
}
