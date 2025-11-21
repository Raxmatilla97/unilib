import { createClient } from '@supabase/supabase-js';
import { GroupCard } from '@/components/groups/GroupCard';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Plus, Search, Filter } from 'lucide-react';

export default async function GroupsPage() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    let groups = [];

    try {
        const { data, error } = await supabase
            .from('groups')
            .select('*, books(title)')
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (data && data.length > 0) {
            groups = data.map((g: any) => ({
                id: g.id,
                name: g.name,
                book: g.books?.title || 'Unknown Book',
                members: g.members_count || 0,
                active: g.is_active,
                tags: g.tags || []
            }));
        }
    } catch (error) {
        console.error('Error fetching groups:', error);
    }

    // Fallback to mock data if no groups found or error occurred
    if (groups.length === 0) {
        groups = [
            { id: '1', name: 'Algorithms & Data Structures', book: 'Introduction to Algorithms (CLRS)', members: 45, active: true, tags: ['CS', 'Algorithms'] },
            { id: '2', name: 'Calculus II Study Squad', book: 'Thomas\' Calculus', members: 28, active: false, tags: ['Math', 'Calculus'] },
            { id: '3', name: 'Organic Chemistry Help', book: 'Organic Chemistry by Wade', members: 112, active: true, tags: ['Chemistry', 'Science'] },
            { id: '4', name: 'Macroeconomics 101', book: 'Principles of Macroeconomics', members: 15, active: false, tags: ['Economics', 'Finance'] },
            { id: '5', name: 'Modern Physics Discussion', book: 'Concepts of Modern Physics', members: 34, active: true, tags: ['Physics', 'Science'] },
            { id: '6', name: 'Web Development Bootcamp', book: 'Full Stack Development', members: 89, active: true, tags: ['CS', 'Web Dev'] },
        ];
    }

    return (
        <ProtectedRoute>
            <div className="container py-10 px-4 md:px-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Study Groups</h1>
                        <p className="text-muted-foreground mt-1">Join a community of learners or create your own squad.</p>
                    </div>
                    <button className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-lg hover:shadow-primary/25">
                        <Plus className="w-5 h-5" />
                        Create Group
                    </button>
                </div>

                {/* Filters & Search */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search groups by name or book..."
                            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                        {['All Groups', 'My Groups', 'Popular', 'Newest'].map((filter, i) => (
                            <button
                                key={i}
                                className={`px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${i === 0
                                    ? 'bg-primary/10 text-primary border border-primary/20'
                                    : 'bg-card border border-border hover:bg-muted'
                                    }`}
                            >
                                {filter}
                            </button>
                        ))}
                        <button className="px-3 py-2.5 rounded-lg border border-border bg-card hover:bg-muted">
                            <Filter className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Groups Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groups.map((group) => (
                        <GroupCard key={group.id} {...group} />
                    ))}
                </div>
            </div>
        </ProtectedRoute>
    );
}
