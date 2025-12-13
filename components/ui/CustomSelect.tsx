"use client";

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface CustomSelectProps {
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
    placeholder?: string;
    className?: string;
}

export function CustomSelect({ value, onChange, options, placeholder = "Tanlang", className = "" }: CustomSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find(opt => opt.value === value);

    return (
        <div ref={dropdownRef} className={`relative ${className}`}>
            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full pl-4 pr-12 py-3 rounded-xl bg-background/50 backdrop-blur-md border border-border hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer transition-all shadow-sm text-sm font-medium text-left relative"
            >
                <span className={`block truncate ${selectedOption ? "text-foreground" : "text-muted-foreground"}`}>
                    {selectedOption?.label || placeholder}
                </span>
                <ChevronDown
                    className={`absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-2 py-2 bg-background/95 backdrop-blur-xl border border-border rounded-xl shadow-2xl max-h-[300px] overflow-y-auto animate-in fade-in-0 zoom-in-95 duration-200">
                    {options.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                                onChange(option.value);
                                setIsOpen(false);
                            }}
                            className={`w-full px-4 py-2.5 text-left text-sm transition-colors flex items-center justify-between group ${value === option.value
                                ? 'bg-primary/10 text-primary font-medium'
                                : 'text-foreground hover:bg-muted/50'
                                }`}
                        >
                            <span>{option.label}</span>
                            {value === option.value && (
                                <Check className="w-4 h-4 text-primary" />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
