/**
 * GradientCard Component
 * Card with refined financial styling and subtle effects
 */

'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { cardHover } from '@/lib/utils/animation-variants';

export interface GradientCardProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    gradient?: 'subtle' | 'primary' | 'accent' | 'success' | 'warning';
    interactive?: boolean;
}

const variantClasses = {
    subtle: 'bg-card border-border/50',
    primary: 'bg-card border-primary/20',
    accent: 'bg-card border-accent/30',
    success: 'bg-card border-success/20',
    warning: 'bg-card border-warning/20',
};

export function GradientCard({
    children,
    className,
    onClick,
    gradient = 'subtle',
    interactive = false,
}: GradientCardProps) {
    const Component = interactive ? motion.div : 'div';

    return (
        <Component
            {...(interactive && {
                initial: 'rest',
                whileHover: 'hover',
                whileTap: 'tap',
                variants: cardHover,
            })}
            onClick={onClick}
            className={cn(
                'relative overflow-hidden rounded-xl border shadow-sm transition-all duration-200',
                variantClasses[gradient],
                interactive && 'cursor-pointer hover:shadow-md hover:border-border',
                className
            )}
        >
            {/* Content */}
            <div className="relative z-10">{children}</div>
        </Component>
    );
}
