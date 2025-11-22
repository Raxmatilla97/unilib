"use client";

import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';

interface CelebrationModalProps {
    isOpen: boolean;
    onClose: () => void;
    achievement?: {
        title: string;
        description: string;
        icon: string;
        xpReward: number;
    };
    dailyGoalCompleted?: boolean;
}

export function CelebrationModal({
    isOpen,
    onClose,
    achievement,
    dailyGoalCompleted = false
}: CelebrationModalProps) {
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setShow(true);
            // Trigger confetti
            const duration = 3000;
            const end = Date.now() + duration;

            const frame = () => {
                confetti({
                    particleCount: 2,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: ['#FFD700', '#FFA500', '#FF6347']
                });
                confetti({
                    particleCount: 2,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: ['#FFD700', '#FFA500', '#FF6347']
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            };
            frame();

            // Auto close after 5 seconds
            const timer = setTimeout(() => {
                handleClose();
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const handleClose = () => {
        setShow(false);
        setTimeout(onClose, 300); // Wait for animation
    };

    if (!isOpen) return null;

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${show ? 'opacity-100' : 'opacity-0'
                }`}
            onClick={handleClose}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Modal Content */}
            <div
                className={`relative bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-2xl p-8 max-w-md w-full shadow-2xl transform transition-all duration-500 ${show ? 'scale-100 rotate-0' : 'scale-50 rotate-12'
                    }`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Content */}
                <div className="text-center text-white">
                    {/* Icon */}
                    <div className="text-8xl mb-4 animate-bounce">
                        {achievement ? achievement.icon : '🎉'}
                    </div>

                    {/* Title */}
                    <h2 className="text-3xl font-bold mb-2">
                        {dailyGoalCompleted ? 'Tabriklaymiz!' : 'Yangi Yutuq!'}
                    </h2>

                    {/* Description */}
                    {achievement ? (
                        <>
                            <p className="text-xl font-semibold mb-2">{achievement.title}</p>
                            <p className="text-white/90 mb-4">{achievement.description}</p>
                            <div className="bg-white/20 rounded-lg px-4 py-2 inline-block">
                                <span className="text-2xl font-bold">+{achievement.xpReward} XP</span>
                            </div>
                        </>
                    ) : dailyGoalCompleted ? (
                        <>
                            <p className="text-xl mb-4">Bugungi maqsadni bajardingiz!</p>
                            <div className="bg-white/20 rounded-lg px-4 py-2 inline-block">
                                <span className="text-2xl font-bold">+50 XP</span>
                            </div>
                        </>
                    ) : null}

                    {/* Continue Button */}
                    <button
                        onClick={handleClose}
                        className="mt-6 bg-white text-orange-500 font-bold py-3 px-8 rounded-lg hover:bg-white/90 transition-colors"
                    >
                        Davom etish
                    </button>
                </div>
            </div>
        </div>
    );
}
