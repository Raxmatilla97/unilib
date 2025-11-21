import { ChatInterface } from '@/components/groups/ChatInterface';
import { FileText, Link as LinkIcon, Users, Settings } from 'lucide-react';

export default function GroupDetailPage({ params }: { params: { id: string } }) {
    return (
        <div className="container py-6 px-4 md:px-6 h-[calc(100vh-4rem)] flex flex-col">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
                {/* Main Chat Area */}
                <div className="lg:col-span-3 h-full">
                    <ChatInterface />
                </div>

                {/* Sidebar Info */}
                <div className="hidden lg:flex flex-col gap-6 h-full overflow-y-auto">
                    {/* Group Info */}
                    <div className="bg-card border border-border rounded-2xl p-6">
                        <h3 className="font-bold mb-2">About Group</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Dedicated to mastering algorithms and data structures using CLRS.
                        </p>
                        <div className="flex items-center gap-2 text-sm font-medium text-primary mb-4">
                            <Users className="w-4 h-4" />
                            <span>45 Members</span>
                        </div>
                        <button className="w-full py-2 rounded-lg border border-border hover:bg-muted text-sm font-medium transition-colors flex items-center justify-center gap-2">
                            <Settings className="w-4 h-4" />
                            Group Settings
                        </button>
                    </div>

                    {/* Shared Resources */}
                    <div className="bg-card border border-border rounded-2xl p-6 flex-1">
                        <h3 className="font-bold mb-4 flex items-center justify-between">
                            Resources
                            <span className="text-xs bg-muted px-2 py-1 rounded-full">12</span>
                        </h3>
                        <div className="space-y-3">
                            {[
                                { name: 'Chapter 4 Summary.pdf', type: 'file' },
                                { name: 'Dynamic Prog. Video', type: 'link' },
                                { name: 'Practice Problems.docx', type: 'file' },
                                { name: 'Graph Theory Notes', type: 'file' }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-lg cursor-pointer transition-colors group">
                                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                        {item.type === 'file' ? <FileText className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{item.name}</p>
                                        <p className="text-xs text-muted-foreground">Added yesterday</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
