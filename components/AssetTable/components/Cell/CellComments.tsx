import React from "react";
import { MessageSquare } from "lucide-react";
// Tooltip imports removed as we use custom CSS popover for now

// Since I haven't checked for Tooltip in ui folder, I will stick to a simpler implementation first using standard Shadcn structure if possible or valid HTML
// Let's use standard title for simplicity unless we confirm Tooltip component exists. 
// Standard Shadcn Tooltip usually at components/ui/tooltip.tsx. I haven't seen it listed, but `Checkbox`, `DropdownMenu` exist. 
// I'll assume Tooltip exists or create a simple hover group.
// Actually, let's use a custom popover behavior with CSS group-hover for safety and zero-dependency bloat if Tooltip isn't there.

export const CellComments: React.FC<{ comments?: string[] }> = ({ comments }) => {
    if (!comments || comments.length === 0) return null;

    return (
        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="relative group/comments">
                <div className="bg-amber-100 p-1 rounded-full cursor-help hover:bg-amber-200 transition-colors">
                    <MessageSquare size={12} className="text-amber-600 fill-amber-600/20" />
                </div>

                {/* Customized Tooltip/Popover */}
                <div className="absolute right-0 bottom-full mb-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover/comments:opacity-100 group-hover/comments:visible transition-all z-50 p-3 pointer-events-none">
                    <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                        Comments ({comments.length})
                    </h5>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                        {comments.map((comment, i) => (
                            <div key={i} className="text-xs text-gray-600 border-l-2 border-amber-300 pl-2">
                                {comment}
                            </div>
                        ))}
                    </div>
                    {/* Tiny arrow */}
                    <div className="absolute right-2 -bottom-1 w-2 h-2 bg-white border-b border-r border-gray-200 rotate-45"></div>
                </div>
            </div>
        </div>
    );
};
