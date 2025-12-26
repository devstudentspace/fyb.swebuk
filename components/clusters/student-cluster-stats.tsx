"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Calendar } from "lucide-react";

interface StudentClusterStatsProps {
  clusterId: string;
}

export function StudentClusterStats({ clusterId }: StudentClusterStatsProps) {
  const [stats, setStats] = useState<{ projects: number; events: number }>({
    projects: 0,
    events: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();

        // Get project count - count from detailed_projects view filtered by cluster_id
        const { count: projectCount } = await supabase
          .from("detailed_projects")
          .select("*", { count: "exact", head: true })
          .eq("cluster_id", clusterId);

        // Get upcoming events count
        const { count: eventsCount } = await supabase
          .from("events")
          .select("*", { count: "exact", head: true })
          .eq("cluster_id", clusterId)
          .gte("start_date", new Date().toISOString());

        setStats({
          projects: projectCount || 0,
          events: eventsCount || 0,
        });
      } catch (error) {
        console.error("Error fetching cluster stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [clusterId]);

  return (
    <>
      <div className="rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-white/10 backdrop-blur-xl p-6 hover:scale-105 transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-slate-400">Projects</p>
          <FileText className="h-5 w-5 text-blue-400" />
        </div>
        <p className="text-3xl font-bold text-white">{loading ? "—" : stats.projects}</p>
        <p className="text-xs text-slate-400 mt-1">Active projects</p>
      </div>
      <div className="rounded-2xl bg-gradient-to-br from-green-500/20 to-teal-500/20 border border-white/10 backdrop-blur-xl p-6 hover:scale-105 transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-slate-400">Events</p>
          <Calendar className="h-5 w-5 text-green-400" />
        </div>
        <p className="text-3xl font-bold text-white">{loading ? "—" : stats.events}</p>
        <p className="text-xs text-slate-400 mt-1">Upcoming events</p>
      </div>
    </>
  );
}
