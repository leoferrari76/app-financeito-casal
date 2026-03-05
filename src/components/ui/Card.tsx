import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
}

export function Card({ children, className = '', style }: CardProps) {
    return (
        <div className={`card glass-panel ${className}`} style={style}>
            {children}
        </div>
    );
}

export function CardHeader({ children, className = '' }: { children: React.ReactNode, className?: string }) {
    return (
        <div className={`card-header ${className}`}>
            {children}
        </div>
    );
}
