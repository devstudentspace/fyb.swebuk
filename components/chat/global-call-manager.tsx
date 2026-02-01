"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { CallNotification } from "./call-notification";
import { toast } from "sonner";

export function GlobalCallManager() {
  const [incomingCall, setIncomingCall] = useState<{ 
    id: string; 
    contextId: string; 
    contextType: string;
    initiator: { name: string; avatar: string | null };
    contextName: string;
  } | null>(null);

  const [myContexts, setMyContexts] = useState<Set<string>>(new Set());
  const router = useRouter();
  const supabase = createClient();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetchMyContexts();
    // Preload ringtone if needed
    // audioRef.current = new Audio("/sounds/ringtone.mp3"); 
  }, []);

  useEffect(() => {
    if (myContexts.size === 0) return;

    // Subscribe to call logs
    // Note: We subscribe to ALL call logs and filter client-side because 
    // Realtime doesn't support "in" array filter easily.
    // For production with thousands of calls, this should be optimized 
    // (e.g. by subscribing to a specific user-channel that the backend publishes to).
    
    const channel = supabase.channel("global-calls")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "call_logs",
          filter: "status=eq.waiting",
        },
        async (payload) => {
          const newCall = payload.new;
          // Check if this call is for one of my contexts
          if (myContexts.has(newCall.context_id)) {
             // Fetch initiator details
             const { data: initiator } = await supabase
               .from("profiles")
               .select("full_name, avatar_url")
               .eq("id", newCall.initiator_id)
               .single();
             
             // Check context name (optional, could be passed or fetched)
             // For now we just show "Incoming Call"
             
             // Don't notify if I started it (shouldn't happen via realtime usually if local, but good to check)
             const { data: { user } } = await supabase.auth.getUser();
             if (user?.id === newCall.initiator_id) return;

             setIncomingCall({
               id: newCall.id,
               contextId: newCall.context_id,
               contextType: newCall.context_type,
               initiator: {
                 name: initiator?.full_name || "Unknown",
                 avatar: initiator?.avatar_url || null
               },
               contextName: "Group Chat" // We could fetch this too
             });
             
             // Play sound?
          }
        }
      )
      .on(
         "postgres_changes",
         {
            event: "UPDATE",
            schema: "public",
            table: "call_logs",
         },
         (payload) => {
            // Dismiss if ended or missed
            if (payload.new.id === incomingCall?.id) {
               if (['ended', 'missed', 'active'].includes(payload.new.status)) {
                  // If it turned active, it might mean someone else joined. 
                  // We can still keep showing it as "Join", or auto-dismiss if we only want "Ringing".
                  // Usually, "Incoming" becomes "Active" call in the list.
                  // For this requirement ("notification"), let's dismiss the "Ringing" popup if it's no longer waiting.
                   if (payload.new.status !== 'waiting') {
                      setIncomingCall(null);
                   }
               }
            }
         }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [myContexts, incomingCall?.id]);

  const fetchMyContexts = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const contexts = new Set<string>();

    // 1. Fetch Clusters
    const { data: clusters } = await supabase
      .from("cluster_members")
      .select("cluster_id")
      .eq("user_id", user.id);
    
    clusters?.forEach(c => contexts.add(c.cluster_id));

    // 2. Fetch Projects
    const { data: projects } = await supabase
      .from("project_members")
      .select("project_id")
      .eq("user_id", user.id);

    projects?.forEach(p => contexts.add(p.project_id));
    
    // 3. Fetch FYP Groups (if any)
    // ...

    setMyContexts(contexts);
  };

  const handleJoin = () => {
    if (!incomingCall) return;
    setIncomingCall(null);
    
    // Navigate to the correct page
    // We assume standard routes:
    // Cluster: /dashboard/student/clusters/[id]
    // Project: /dashboard/student/projects/[id]
    // Note: Roles might differ (staff vs student). 
    // Ideally we detect role or use a generic route. 
    // For now, let's assume Student dashboard or try to construct it.
    
    let path = "";
    if (incomingCall.contextType === "cluster") {
       path = `/dashboard/student/clusters/${incomingCall.contextId}`; 
    } else if (incomingCall.contextType === "project") {
       path = `/dashboard/student/projects/${incomingCall.contextId}`;
    }
    
    // Check role to be safe? Or just try to go there. 
    // If staff, they might need /dashboard/staff/clusters/...
    // Let's check the current URL or just assume student for now as primary use case,
    // Or we can rely on a smart redirector.
    
    // Better: Check current role from path if possible, or fetch profile.
    // Simple heuristic:
    if (window.location.pathname.includes("/staff")) {
        path = path.replace("/student", "/staff");
    }
    
    if (path) {
      router.push(path);
      toast.info("Joining call...", { description: "Redirecting to chat room." });
    }
  };

  const handleIgnore = () => {
    setIncomingCall(null);
  };

  if (!incomingCall) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <CallNotification
        callerName={incomingCall.initiator.name}
        callerAvatar={incomingCall.initiator.avatar}
        onJoin={handleJoin}
        onIgnore={handleIgnore}
      />
    </div>
  );
}
