
import { CalendarEvent } from "@/types/calendar";
import { 
  addDays, 
  addMonths, 
  endOfMonth, 
  endOfWeek, 
  format, 
  getDay, 
  isSameDay, 
  isSameMonth, 
  isToday, 
  startOfMonth, 
  startOfWeek, 
  subMonths 
} from "date-fns";

export const getCalendarDays = (month: number, year: number) => {
  const date = new Date(year, month, 1);
  const firstDay = startOfWeek(startOfMonth(date));
  const lastDay = endOfWeek(endOfMonth(date));
  
  const days = [];
  let currentDay = firstDay;
  
  while (currentDay <= lastDay) {
    days.push({
      date: new Date(currentDay),
      isCurrentMonth: isSameMonth(currentDay, date),
      isToday: isToday(currentDay),
      dayOfMonth: currentDay.getDate(),
      dayOfWeek: getDay(currentDay)
    });
    currentDay = addDays(currentDay, 1);
  }
  
  return days;
};

export const getEventsForDay = (events: CalendarEvent[], date: Date) => {
  return events.filter(event => isSameDay(event.start, date));
};

export const formatEventTime = (event: CalendarEvent) => {
  if (event.isAllDay) {
    return 'All day';
  }
  
  return `${format(event.start, 'h:mm a')} - ${format(event.end, 'h:mm a')}`;
};

export const timeToMinutes = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

export const minutesToTime = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

export const generateTimeSlots = (startTime: string = '00:00', endTime: string = '23:59', interval: number = 30) => {
  const slots = [];
  let current = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  
  while (current <= end) {
    slots.push(minutesToTime(current));
    current += interval;
  }
  
  return slots;
};

export const generateMockEvents = (count: number, startDate: Date): CalendarEvent[] => {
  const events: CalendarEvent[] = [];
  const eventTypes: Array<'event' | 'focus' | 'suggestion'> = ['event', 'focus', 'suggestion'];
  const priorities: Array<'low' | 'medium' | 'high'> = ['low', 'medium', 'high'];
  const titles = [
    'Team Meeting',
    'Client Call',
    'Project Review',
    'Sprint Planning',
    'Lunch Break',
    'Code Review',
    'Design Session',
    'One-on-One',
    'Product Demo',
    'Documentation'
  ];

  for (let i = 0; i < count; i++) {
    const dayOffset = Math.floor(Math.random() * 14) - 7; // -7 to +7 days
    const eventDate = addDays(startDate, dayOffset);
    
    // Random start time between 9am and 5pm
    const hour = 9 + Math.floor(Math.random() * 8);
    const minute = Math.floor(Math.random() * 4) * 15; // 0, 15, 30, or 45
    
    eventDate.setHours(hour, minute, 0, 0);
    
    // Random duration between 30min and 2 hours
    const durationMinutes = (Math.floor(Math.random() * 4) + 1) * 30;
    const endDate = new Date(eventDate);
    endDate.setMinutes(endDate.getMinutes() + durationMinutes);
    
    const type = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    const priority = priorities[Math.floor(Math.random() * priorities.length)];
    const title = titles[Math.floor(Math.random() * titles.length)];
    
    events.push({
      id: `event-${i}`,
      title,
      start: eventDate,
      end: endDate,
      type,
      priority,
      description: `Description for ${title}`,
      participants: ['Jane Doe', 'John Smith']
    });
  }
  
  return events;
};
