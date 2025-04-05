
import { aiCalendarService } from "@/lib/aiCalendarService";
import { generateMockEvents } from "@/lib/calendarUtils";
import { CalendarEvent, CalendarView, SuggestionSettings, TimeBlock } from "@/types/calendar";
import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import { addMonths, startOfToday, subMonths } from "date-fns";
import { useToast } from "@/components/ui/use-toast";

interface CalendarContextProps {
  events: CalendarEvent[];
  suggestions: CalendarEvent[];
  focusBlocks: TimeBlock[];
  calendarView: CalendarView;
  settings: SuggestionSettings;
  addEvent: (event: Omit<CalendarEvent, "id">) => string;
  updateEvent: (event: CalendarEvent) => void;
  deleteEvent: (id: string) => void;
  changeMonth: (direction: 'next' | 'prev') => void;
  changeView: (view: 'day' | 'week' | 'month') => void;
  parseNaturalLanguage: (text: string) => Partial<CalendarEvent> | null;
  updateSettings: (settings: Partial<SuggestionSettings>) => void;
  generateSuggestions: () => void;
}

const CalendarContext = createContext<CalendarContextProps | undefined>(undefined);

export const CalendarProvider = ({ children }: { children: ReactNode }) => {
  const today = startOfToday();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [suggestions, setSuggestions] = useState<CalendarEvent[]>([]);
  const [focusBlocks, setFocusBlocks] = useState<TimeBlock[]>([]);
  const [calendarView, setCalendarView] = useState<CalendarView>({
    month: today.getMonth(),
    year: today.getFullYear(),
    view: 'month'
  });
  const [settings, setSettings] = useState<SuggestionSettings>(
    aiCalendarService.getSettings()
  );

  const { toast } = useToast();

  // Initialize with mock data
  useEffect(() => {
    const mockEvents = generateMockEvents(15, today);
    setEvents(mockEvents);
    generateSuggestions();
  }, []);

  const addEvent = (eventData: Omit<CalendarEvent, "id">) => {
    const id = `event-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newEvent = { ...eventData, id };
    setEvents(prev => [...prev, newEvent]);
    
    toast({
      title: "Event Created",
      description: `${newEvent.title} has been added to your calendar.`,
    });
    
    return id;
  };

  const updateEvent = (updatedEvent: CalendarEvent) => {
    setEvents(prev => 
      prev.map(event => 
        event.id === updatedEvent.id ? updatedEvent : event
      )
    );
    
    toast({
      title: "Event Updated",
      description: `${updatedEvent.title} has been updated.`,
    });
  };

  const deleteEvent = (id: string) => {
    const eventToDelete = events.find(e => e.id === id);
    setEvents(prev => prev.filter(event => event.id !== id));
    
    if (eventToDelete) {
      toast({
        title: "Event Deleted",
        description: `${eventToDelete.title} has been removed from your calendar.`,
        variant: "destructive",
      });
    }
  };

  const changeMonth = (direction: 'next' | 'prev') => {
    setCalendarView(prev => {
      const date = new Date(prev.year, prev.month);
      const newDate = direction === 'next' 
        ? addMonths(date, 1) 
        : subMonths(date, 1);
      
      return {
        ...prev,
        month: newDate.getMonth(),
        year: newDate.getFullYear()
      };
    });
  };

  const changeView = (view: 'day' | 'week' | 'month') => {
    setCalendarView(prev => ({ ...prev, view }));
  };

  const parseNaturalLanguage = (text: string) => {
    return aiCalendarService.parseNaturalLanguage(text);
  };

  const updateSettings = (newSettings: Partial<SuggestionSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    aiCalendarService.updateSettings(updatedSettings);
    
    toast({
      title: "Settings Updated",
      description: "Your calendar settings have been updated.",
    });
    
    generateSuggestions();
  };

  const generateSuggestions = () => {
    // Clear existing suggestions
    setSuggestions([]);
    setFocusBlocks([]);
    
    // Generate new suggestions if enabled
    if (settings.enableMeetingSuggestions) {
      const today = new Date();
      const suggestionTime = aiCalendarService.suggestMeetingTime(events);
      
      if (suggestionTime) {
        const newSuggestion: CalendarEvent = {
          id: `suggestion-${Date.now()}`,
          title: 'Suggested Meeting',
          start: suggestionTime.start,
          end: suggestionTime.end,
          priority: 'medium',
          type: 'suggestion',
          description: 'AI suggested optimal meeting time'
        };
        
        setSuggestions([newSuggestion]);
      }
    }
    
    // Generate focus time suggestions
    if (settings.enableFocusTime) {
      const todayFocusBlocks = aiCalendarService.suggestFocusTimeBlocks(events);
      setFocusBlocks(todayFocusBlocks);
    }
  };

  return (
    <CalendarContext.Provider value={{
      events,
      suggestions,
      focusBlocks,
      calendarView,
      settings,
      addEvent,
      updateEvent,
      deleteEvent,
      changeMonth,
      changeView,
      parseNaturalLanguage,
      updateSettings,
      generateSuggestions
    }}>
      {children}
    </CalendarContext.Provider>
  );
};

export const useCalendar = () => {
  const context = useContext(CalendarContext);
  
  if (context === undefined) {
    throw new Error('useCalendar must be used within a CalendarProvider');
  }
  
  return context;
};
