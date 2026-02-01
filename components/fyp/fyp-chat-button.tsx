"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UnifiedChat } from "@/components/chat/unified-chat";

interface FYPChatButtonProps {
  fypId: string;
  currentUserId: string;
  currentUserName: string;
  currentUserAvatar: string | null;
  supervisorName: string;
}

export function FYPChatButton({
  fypId,
  currentUserId,
  currentUserName,
  currentUserAvatar,
  supervisorName,
}: FYPChatButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">
          <MessageSquare className="mr-2 h-4 w-4" />
          Project Chatroom
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[92vw] h-auto max-h-[85vh] sm:max-w-[500px] p-0 gap-0 overflow-hidden border-none bg-transparent shadow-none">
        <DialogTitle className="sr-only">Project Chat</DialogTitle>
        <UnifiedChat
          id={fypId}
          table="fyp_chat"
          idColumn="fyp_id"
          title={`Chat with ${supervisorName}`}
          currentUserId={currentUserId}
          currentUserName={currentUserName}
          currentUserAvatar={currentUserAvatar}
        />
      </DialogContent>
    </Dialog>
  );
}
