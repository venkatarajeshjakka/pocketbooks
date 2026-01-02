/**
 * GradientCard Component
 * Card with glassmorphism effect and gradient background
 */

'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { cardHover } from '@/lib/utils/animation-variants';

export interface GradientCardProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    gradient?: 'subtle' | 'primary' | 'accent';
    interactive?: boolean;
}

const gradientClasses = {
    subtle: 'bg-gradient-to-br from-background via-background to-muted/20',
    primary: 'bg-gradient-to-br from-primary/5 via-background to-background',
    accent: 'bg-gradient-to-br from-accent/5 via-background to-background',
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
                'relative overflow-hidden rounded-lg border border-border/50 backdrop-blur-sm transition-colors duration-200',
                gradientClasses[gradient],
                interactive && 'cursor-pointer transition-shadow hover:shadow-lg',
                className
            )}
        >
            {/* Glass effect overlay */}
            <div className="absolute inset-0 bg-card/50 backdrop-blur-sm" />

            {/* Content */}
            <div className="relative">{children}</div>

            {/* Subtle gradient overlay */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/5 to-transparent dark:from-white/10" />
        </Component>
    );
}
