'use client';

import { IClient } from '@/types';
import { ActivityTimeline } from './activity-timeline';
import { SalesHistoryEmpty } from './sales-history-empty';

interface ActivityTabProps {
  client: IClient;
}

export function ActivityTab({ client }: ActivityTabProps) {
  return (
    <div className="space-y-6">
      {/* Sales History Section */}
      <div className="saas-card p-6">
        <h3 className="font-semibold text-[var(--saas-heading)] mb-4">Sales History</h3>
        <SalesHistoryEmpty />
      </div>

      {/* Activity Timeline */}
      <div className="saas-card p-6">
        <h3 className="font-semibold text-[var(--saas-heading)] mb-4">Activity Log</h3>
        <ActivityTimeline client={client} />
      </div>
    </div>
  );
}
