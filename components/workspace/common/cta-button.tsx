
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ArrowRight, Loader2 } from 'lucide-react';

interface CtaButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    isLoading?: boolean;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    fullWidth?: boolean;
}

export function CtaButton({
    children,
    isLoading,
    variant = 'primary',
    fullWidth = false,
    className,
    ...props
}: CtaButtonProps) {
    const baseStyles = "font-bold shadow-sm transition-all duration-300 active:scale-95";

    const variants = {
        primary: "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-md",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        outline: "border-2 border-primary text-primary hover:bg-primary/5",
        ghost: "hover:bg-accent hover:text-accent-foreground",
    };

    return (
        <Button
            className={cn(
                baseStyles,
                variants[variant],
                fullWidth && "w-full",
                className
            )}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {children}
            {!isLoading && variant === 'primary' && (
                <ArrowRight className="ml-2 h-4 w-4 opacity-70" />
            )}
        </Button>
    );
}
