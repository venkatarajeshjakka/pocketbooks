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

const glassClasses = {
    subtle: 'bg-background/40 border-border/50',
    primary: 'bg-primary/5 border-primary/20',
    accent: 'bg-accent/5 border-accent/20',
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
                'relative overflow-hidden rounded-2xl border backdrop-blur-xl transition-all duration-300',
                glassClasses[gradient],
                interactive && 'cursor-pointer hover:shadow-2xl hover:shadow-foreground/5',
                className
            )}
        >
            {/* Glossy overlay effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent dark:from-white/2" />

            {/* Content */}
            <div className="relative z-10">{children}</div>
        </Component>
    );
}
