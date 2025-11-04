import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar as CalendarIcon, Clock, MapPin, Users } from "lucide-react";
import { toast } from "sonner";
import { CalendarEventModal } from "@/components/CalendarEventModal";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from "date-fns";

interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  location: string | null;
  event_type: string;
  attendees: string[];
  created_by: string;
}

export default function Calendar() {
  const { user } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchEvents();
      subscribeToEvents();
    }
  }, [user]);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("calendar_events")
        .select("*")
        .order("start_time", { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Failed to load events");
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeToEvents = () => {
    const channel = supabase
      .channel("calendar-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "calendar_events" },
        () => fetchEvents()
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  };

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(selectedDate),
    end: endOfMonth(selectedDate),
  });

  const getEventsForDate = (date: Date) => {
    return events.filter((event) =>
      isSameDay(new Date(event.start_time), date)
    );
  };

  const eventTypeColors = {
    meeting: "bg-blue-100 text-blue-800 dark:bg-blue-900",
    call: "bg-green-100 text-green-800 dark:bg-green-900",
    deadline: "bg-red-100 text-red-800 dark:bg-red-900",
    reminder: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900",
    other: "bg-gray-100 text-gray-800 dark:bg-gray-900",
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 p-6">
      <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Calendar
            </h1>
            <p className="text-muted-foreground mt-1">
              {format(selectedDate, "MMMM yyyy")}
            </p>
          </div>
          <Button onClick={() => { setSelectedEvent(null); setIsModalOpen(true); }} className="gap-2">
            <Plus className="h-4 w-4" />
            New Event
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-center font-semibold text-sm p-2">
              {day}
            </div>
          ))}

          {daysInMonth.map((day) => {
            const dayEvents = getEventsForDate(day);
            return (
              <Card
                key={day.toISOString()}
                className={`p-2 min-h-[120px] cursor-pointer hover:shadow-lg transition-all ${
                  isToday(day) ? "border-primary border-2" : "border-border/50"
                }`}
                onClick={() => setSelectedDate(day)}
              >
                <div className="text-sm font-medium mb-2">
                  {format(day, "d")}
                </div>
                <div className="space-y-1">
                  {dayEvents.slice(0, 2).map((event) => (
                    <div
                      key={event.id}
                      className={`text-xs p-1 rounded truncate ${
                        eventTypeColors[event.event_type as keyof typeof eventTypeColors]
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEvent(event);
                        setIsModalOpen(true);
                      }}
                    >
                      {format(new Date(event.start_time), "HH:mm")} {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-xs text-muted-foreground">
                      +{dayEvents.length - 2} more
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <CalendarEventModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedEvent(null); }}
        event={selectedEvent}
        defaultDate={selectedDate}
        onSuccess={fetchEvents}
      />
    </div>
  );
}
