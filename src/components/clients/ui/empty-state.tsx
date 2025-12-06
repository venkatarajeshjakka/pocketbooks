/**
 * EmptyState Component
 * Beautiful empty state with optional action button
 */

'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fadeInUp, scaleIn } from '@/lib/utils/animation-variants';

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <motion.div
        variants={scaleIn}
        className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted/50"
      >
        <Icon className="h-10 w-10 text-muted-foreground/50" />
      </motion.div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action && (
        <motion.div variants={fadeInUp} className="mt-6">
          <Button onClick={action.onClick}>{action.label}</Button>
        </motion.div>
      )}
    </motion.div>
  );
}
