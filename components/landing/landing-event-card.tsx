import Link from "next/link";
import { Calendar, MapPin, Users, Clock, Star, CheckCircle2 } from "lucide-react";
import type { DetailedEvent } from "@/lib/constants/events";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface LandingEventCardProps {
  event: DetailedEvent;
  variant?: "default" | "compact" | "featured";
  showOrganizer?: boolean;
}

export function LandingEventCard({
  event,
  variant = "default",
  showOrganizer = true
}: LandingEventCardProps) {
  const getEventTimeStatus = (startDate: string, endDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) {
      // Upcoming
      return { status: "upcoming", label: "Upcoming" };
    } else if (now >= start && now <= end) {
      // Ongoing
      return { status: "ongoing", label: "Ongoing" };
    } else {
      // Completed
      return { status: "completed", label: "Completed" };
    }
  };

  const timeStatus = getEventTimeStatus(event.start_date, event.end_date);

  return (
    <Link href={`/events/${event.slug}`}>
      <div className="glass-card feature-card animate-on-scroll">
        <div className="feature-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
        </div>
        <h4 className="font-bold text-white">{event.title}</h4>
        <p className="text-slate-300">{event.short_description}</p>
        <div className="flex items-center justify-between text-xs text-slate-400 mt-2">
          <span>{new Date(event.start_date).toLocaleDateString()}</span>
          <span className={`px-2 py-0.5 rounded-full ${
            timeStatus.status === "upcoming"
              ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
              : timeStatus.status === "ongoing"
              ? "bg-green-500/20 text-green-400 border border-green-500/30"
              : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
          }`}>
            {timeStatus.label}
          </span>
        </div>
      </div>
    </Link>
  );
}