"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { postFYPComment } from "@/lib/supabase/fyp-actions";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user: {
    full_name: string;
    avatar_url: string | null;
  };
}

interface FYPCommentsProps {
  fypId: string;
  initialComments: Comment[];
}

export function FYPComments({ fypId, initialComments }: FYPCommentsProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState("");
  const [posting, setPosting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setPosting(true);
    try {
      const result = await postFYPComment(fypId, newComment);
      if (result.success) {
        toast.success("Comment posted");
        setNewComment("");
        // Ideally we'd refetch or optimistically update, but for now relying on revalidatePath from server action
        // However, revalidatePath refreshes server components. Client state needs manual update or full page refresh.
        // Let's do a simple reload for now or just wait for Next.js to handle the RSC refresh.
        // Since we are in a client component, we might not see the update immediately without a router.refresh()
        window.location.reload(); 
      } else {
        toast.error("Failed to post comment");
      }
    } catch (error) {
      toast.error("Error posting comment");
    } finally {
      setPosting(false);
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-lg">Discussion</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6 mb-6">
          {comments.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-4">No comments yet.</p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={comment.user.avatar_url || undefined} />
                  <AvatarFallback>{comment.user.full_name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{comment.user.full_name}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 bg-muted p-3 rounded-md">
                    {comment.content}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <Textarea
            placeholder="Type your message here..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[80px]"
          />
          <div className="flex justify-end">
            <Button type="submit" size="sm" disabled={posting || !newComment.trim()}>
              {posting ? "Posting..." : "Post Comment"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
