import { QueryClient } from '@tanstack/react-query'

// Create a singleton query client for server-side usage
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // Cache configuration
            staleTime: 60 * 1000, // 1 minute
            gcTime: 5 * 60 * 1000, // 5 minutes (garbage collection time)

            // Refetch configuration
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
            refetchOnMount: false,

            // Retry configuration
            retry: 2,
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

            // Performance
            structuralSharing: true,
        },
        mutations: {
            retry: 1,
            retryDelay: 1000,
        },
    },
})

// Query keys for consistent caching
export const queryKeys = {
    // User queries
    user: (userId: string) => ['user', userId] as const,
    userProfile: (userId: string) => ['user', 'profile', userId] as const,
    userProgress: (userId: string) => ['user', 'progress', userId] as const,
    userAchievements: (userId: string) => ['user', 'achievements', userId] as const,

    // Book queries
    books: () => ['books'] as const,
    book: (bookId: string) => ['books', bookId] as const,
    booksByCategory: (category: string) => ['books', 'category', category] as const,

    // Checkout queries
    checkouts: () => ['checkouts'] as const,
    userCheckouts: (userId: string) => ['checkouts', 'user', userId] as const,
    activeCheckouts: () => ['checkouts', 'active'] as const,

    // Dashboard queries
    dashboard: (userId: string) => ['dashboard', userId] as const,

    // Leaderboard queries
    leaderboard: (type: 'xp' | 'streak') => ['leaderboard', type] as const,

    // Stats queries
    todayStats: () => ['stats', 'today'] as const,
} as const

// Helper function to invalidate related queries
export const invalidateQueries = {
    user: (userId: string) => {
        queryClient.invalidateQueries({ queryKey: queryKeys.user(userId) })
        queryClient.invalidateQueries({ queryKey: queryKeys.userProfile(userId) })
    },

    userProgress: (userId: string) => {
        queryClient.invalidateQueries({ queryKey: queryKeys.userProgress(userId) })
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(userId) })
    },

    checkouts: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.checkouts() })
        queryClient.invalidateQueries({ queryKey: queryKeys.activeCheckouts() })
        queryClient.invalidateQueries({ queryKey: queryKeys.todayStats() })
    },

    books: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.books() })
    },
}
