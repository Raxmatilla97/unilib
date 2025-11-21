"use client";

import { motion } from 'framer-motion';

interface XPBarProps {
    currentXP: number;
    maxXP: number;
    level: number;
}

export function XPBar({ currentXP, maxXP, level }: XPBarProps) {
    const percentage = Math.min((currentXP / maxXP) * 100, 100);

    return (
        <div className="w-full">
            <div className="flex justify-between items-end mb-2">
                <div>
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Level {level}</span>
                    <div className="text-2xl font-bold text-primary">Scholar</div>
                </div>
                <div className="text-right">
                    <span className="text-sm font-medium text-foreground">{currentXP}</span>
                    <span className="text-sm text-muted-foreground"> / {maxXP} XP</span>
                </div>
            </div>

            <div className="h-3 w-full bg-muted rounded-full overflow-hidden relative">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-primary to-accent rounded-full relative"
                >
                    <div className="absolute inset-0 bg-primary/20 animate-pulse-slow" />
                </motion.div>
            </div>

            <div className="mt-1 text-xs text-muted-foreground text-right">
                {maxXP - currentXP} XP to Level {level + 1}
            </div>
        </div>
    );
}
