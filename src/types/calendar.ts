
export type EventPriority = 'low' | 'medium' | 'high';
export type EventType = 'event' | 'focus' | 'suggestion';

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  priority: EventPriority;
  type: EventType;
  description?: string;
  location?: string;
  participants?: string[];
  isAllDay?: boolean;
  color?: string;
}

export interface TimeBlock {
  id: string;
  start: Date;
  end: Date;
  type: 'focus' | 'meeting' | 'break';
  title: string;
}

export interface CalendarView {
  month: number;
  year: number;
  view: 'day' | 'week' | 'month';
}

export interface SuggestionSettings {
  enableFocusTime: boolean;
  enableMeetingSuggestions: boolean;
  enablePriorityAssignment: boolean;
  workingHours: {
    start: string; // Format: 'HH:MM'
    end: string;   // Format: 'HH:MM'
  };
  preferredMeetingDuration: number; // in minutes
  focusTimePreference: 'morning' | 'afternoon' | 'custom';
  customFocusTimes?: {
    start: string;
    end: string;
  }[];
}
