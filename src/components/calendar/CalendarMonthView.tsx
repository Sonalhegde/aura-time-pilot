
import { useCalendar } from "@/context/CalendarContext";
import { getCalendarDays, getEventsForDay } from "@/lib/calendarUtils";
import { CalendarEvent } from "@/types/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useState } from "react";
import EventDialog from "./EventDialog";

const CalendarMonthView = () => {
  const { events, suggestions, focusBlocks, calendarView } = useCalendar();
  const { month, year } = calendarView;
  const calendarDays = getCalendarDays(month, year);
  
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // Combine regular events, suggestions, and focus blocks
  const allEvents = [
    ...events,
    ...suggestions,
    ...focusBlocks.map(block => ({
      id: block.id,
      title: block.title,
      start: block.start,
      end: block.end,
      priority: 'low' as const,
      type: 'focus' as const
    }))
  ];
  
  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsDialogOpen(true);
  };
  
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setSelectedEvent(null);
    setIsDialogOpen(true);
  };
  
  return (
    <>
      <div className="calendar-grid mb-4">
        {/* Day headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div 
            key={day} 
            className="p-2 text-center font-medium text-sm"
          >
            {day}
          </div>
        ))}
        
        {/* Calendar days */}
        {calendarDays.map(({ date, isCurrentMonth, isToday, dayOfMonth }) => {
          const dayEvents = getEventsForDay(allEvents, date);
          
          return (
            <div
              key={date.toISOString()}
              className={cn(
                "calendar-day border p-1",
                !isCurrentMonth && "not-current-month",
                isToday && "today"
              )}
              onClick={() => handleDateClick(date)}
            >
              <div className="text-right mb-1">
                <span className={cn(
                  "inline-block w-6 h-6 rounded-full text-sm leading-6 text-center",
                  isToday && "bg-primary text-white"
                )}>
                  {dayOfMonth}
                </span>
              </div>
              
              <div className="overflow-y-auto max-h-[95px]">
                {dayEvents.map((event) => (
                  <div
                    key={event.id}
                    className={cn(
                      "calendar-event",
                      `priority-${event.priority}`,
                      event.type === 'focus' && "focus-time",
                      event.type === 'suggestion' && "suggestion"
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEventClick(event);
                    }}
                  >
                    {!event.isAllDay && (
                      <span className="text-xs opacity-75">
                        {format(event.start, "h:mm a")}
                      </span>
                    )}{" "}
                    {event.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      
      <EventDialog
        event={selectedEvent}
        date={selectedDate}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </>
  );
};

export default CalendarMonthView;
