/**
 * ClientListSkeleton Component
 * Loading skeleton for client list
 */

'use client';

import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { GradientCard } from './gradient-card';
import { staggerContainer, fadeInUp } from '@/lib/utils/animation-variants';

export interface ClientListSkeletonProps {
  view?: 'grid' | 'table';
  count?: number;
}

export function ClientListSkeleton({ view = 'table', count = 6 }: ClientListSkeletonProps) {
  if (view === 'grid') {
    return (
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        {Array.from({ length: count }).map((_, i) => (
          <motion.div key={i} variants={fadeInUp}>
            <GradientCard>
              <div className="p-5 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5 rounded" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                  <Skeleton className="h-8 w-8 rounded" />
                </div>

                {/* Name */}
                <div className="space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>

                {/* Contact Info */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-border/50 pt-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>

                <Skeleton className="h-3 w-32" />
              </div>
            </GradientCard>
          </motion.div>
        ))}
      </motion.div>
    );
  }

  // Table skeleton
  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="overflow-hidden rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm"
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/50">
              <th className="p-4 text-left">
                <Skeleton className="h-5 w-5 rounded" />
              </th>
              <th className="p-4 text-left">
                <Skeleton className="h-4 w-16" />
              </th>
              <th className="p-4 text-left hidden md:table-cell">
                <Skeleton className="h-4 w-16" />
              </th>
              <th className="p-4 text-left hidden lg:table-cell">
                <Skeleton className="h-4 w-16" />
              </th>
              <th className="p-4 text-left">
                <Skeleton className="h-4 w-16" />
              </th>
              <th className="p-4 text-right">
                <Skeleton className="h-4 w-24 ml-auto" />
              </th>
              <th className="p-4 text-left hidden xl:table-cell">
                <Skeleton className="h-4 w-24" />
              </th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: count }).map((_, i) => (
              <tr key={i} className="border-b border-border/50">
                <td className="p-4">
                  <Skeleton className="h-5 w-5 rounded" />
                </td>
                <td className="p-4">
                  <Skeleton className="h-5 w-32 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </td>
                <td className="p-4 hidden md:table-cell">
                  <Skeleton className="h-4 w-40" />
                </td>
                <td className="p-4 hidden lg:table-cell">
                  <Skeleton className="h-4 w-24" />
                </td>
                <td className="p-4">
                  <Skeleton className="h-5 w-16 rounded-full" />
                </td>
                <td className="p-4 text-right">
                  <Skeleton className="h-4 w-20 ml-auto" />
                </td>
                <td className="p-4 hidden xl:table-cell">
                  <Skeleton className="h-4 w-24" />
                </td>
                <td className="p-4">
                  <Skeleton className="h-8 w-8 rounded ml-auto" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
