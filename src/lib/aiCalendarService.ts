import { CalendarEvent, EventPriority, SuggestionSettings, TimeBlock } from "@/types/calendar";
import { addDays, addMinutes, format, isSameDay, parse, setHours, setMinutes } from "date-fns";

class AICalendarService {
  private settings: SuggestionSettings;

  constructor() {
    // Default settings
    this.settings = {
      enableFocusTime: true,
      enableMeetingSuggestions: true,
      enablePriorityAssignment: true,
      workingHours: {
        start: '09:00',
        end: '17:00',
      },
      preferredMeetingDuration: 30,
      focusTimePreference: 'morning',
    };
  }

  updateSettings(settings: Partial<SuggestionSettings>): void {
    this.settings = { ...this.settings, ...settings };
  }

  getSettings(): SuggestionSettings {
    return this.settings;
  }

  // Suggest optimal meeting time based on existing calendar and preferences
  suggestMeetingTime(
    existingEvents: CalendarEvent[],
    duration: number = this.settings.preferredMeetingDuration,
    startDate: Date = new Date(),
    participantCount: number = 1
  ): { start: Date; end: Date } | null {
    // Look ahead 5 days
    const maxLookAheadDays = 5;
    
    for (let dayOffset = 0; dayOffset < maxLookAheadDays; dayOffset++) {
      const targetDate = addDays(startDate, dayOffset);
      
      // Working hours for the day
      const workStart = this.parseTimeToDate(this.settings.workingHours.start, targetDate);
      const workEnd = this.parseTimeToDate(this.settings.workingHours.end, targetDate);
      
      // Filter events for this day
      const dayEvents = existingEvents.filter(event => 
        isSameDay(event.start, targetDate)
      ).sort((a, b) => a.start.getTime() - b.start.getTime());
      
      // Find available slots
      const slots = this.findAvailableTimeSlots(dayEvents, workStart, workEnd, duration);
      
      if (slots.length > 0) {
        // For simplicity, return the first available slot
        // In a real implementation, you would score slots based on various factors
        return {
          start: slots[0].start,
          end: slots[0].end
        };
      }
    }
    
    return null;
  }

  // Find available time slots in a day
  private findAvailableTimeSlots(
    events: CalendarEvent[],
    dayStart: Date,
    dayEnd: Date,
    durationMinutes: number
  ): Array<{ start: Date; end: Date }> {
    const slots: Array<{ start: Date; end: Date }> = [];
    
    // Start with the beginning of the day
    let currentTime = new Date(dayStart);
    
    // For each event, check if there's enough time before it
    for (const event of events) {
      const timeBefore = event.start.getTime() - currentTime.getTime();
      const minutesBefore = timeBefore / (1000 * 60);
      
      if (minutesBefore >= durationMinutes) {
        slots.push({
          start: currentTime,
          end: addMinutes(currentTime, durationMinutes)
        });
      }
      
      // Move current time to the end of this event
      currentTime = new Date(event.end);
    }
    
    // Check if there's time after the last event
    const timeAfterLastEvent = dayEnd.getTime() - currentTime.getTime();
    const minutesAfterLast = timeAfterLastEvent / (1000 * 60);
    
    if (minutesAfterLast >= durationMinutes) {
      slots.push({
        start: currentTime,
        end: addMinutes(currentTime, durationMinutes)
      });
    }
    
    return slots;
  }

  // Suggest focus time blocks based on calendar and preferences
  suggestFocusTimeBlocks(
    existingEvents: CalendarEvent[],
    startDate: Date = new Date()
  ): TimeBlock[] {
    if (!this.settings.enableFocusTime) return [];
    
    const focusBlocks: TimeBlock[] = [];
    const workStart = this.parseTimeToDate(this.settings.workingHours.start, startDate);
    const workEnd = this.parseTimeToDate(this.settings.workingHours.end, startDate);
    
    // Filter events for the target day
    const dayEvents = existingEvents.filter(event => 
      isSameDay(event.start, startDate)
    ).sort((a, b) => a.start.getTime() - b.start.getTime());
    
    // Define target focus time based on preference
    let focusStartTime: Date;
    let focusEndTime: Date;
    
    if (this.settings.focusTimePreference === 'morning') {
      focusStartTime = addMinutes(workStart, 30); // 30 min after work starts
      focusEndTime = addMinutes(focusStartTime, 120); // 2 hour focus block
    } else if (this.settings.focusTimePreference === 'afternoon') {
      focusEndTime = addMinutes(workEnd, -30); // 30 min before work ends
      focusStartTime = addMinutes(focusEndTime, -120); // 2 hour focus block
    } else if (this.settings.customFocusTimes && this.settings.customFocusTimes.length > 0) {
      // Use custom focus times if defined
      const custom = this.settings.customFocusTimes[0];
      focusStartTime = this.parseTimeToDate(custom.start, startDate);
      focusEndTime = this.parseTimeToDate(custom.end, startDate);
    } else {
      // Default mid-day
      const midDay = new Date(workStart);
      midDay.setHours(13, 0, 0, 0);
      focusStartTime = midDay;
      focusEndTime = addMinutes(midDay, 120);
    }
    
    // Check if focus time conflicts with existing events
    const hasConflict = dayEvents.some(event => 
      (event.start < focusEndTime && event.end > focusStartTime)
    );
    
    if (!hasConflict) {
      focusBlocks.push({
        id: `focus-${focusStartTime.getTime()}`,
        start: focusStartTime,
        end: focusEndTime,
        type: 'focus',
        title: 'Focus Time'
      });
    }
    
    return focusBlocks;
  }

  // Predict priority for an event based on title, participants, etc.
  predictEventPriority(
    title: string,
    description?: string,
    participants?: string[]
  ): EventPriority {
    if (!this.settings.enablePriorityAssignment) return 'medium';
    
    // Simple keyword-based priority prediction
    const highPriorityKeywords = ['urgent', 'important', 'asap', 'critical', 'deadline'];
    const lowPriorityKeywords = ['optional', 'fyi', 'casual', 'coffee'];
    
    const combinedText = `${title} ${description || ''}`.toLowerCase();
    
    if (highPriorityKeywords.some(keyword => combinedText.includes(keyword))) {
      return 'high';
    }
    
    if (lowPriorityKeywords.some(keyword => combinedText.includes(keyword))) {
      return 'low';
    }
    
    // Consider more participants as higher priority
    if (participants && participants.length > 5) {
      return 'high';
    } else if (participants && participants.length > 2) {
      return 'medium';
    }
    
    return 'medium';
  }

  // Parse a time string to a Date object on the given date
  private parseTimeToDate(timeString: string, date: Date): Date {
    const [hours, minutes] = timeString.split(':').map(Number);
    const result = new Date(date);
    result.setHours(hours, minutes, 0, 0);
    return result;
  }

  // Parse natural language into calendar event (simplified)
  parseNaturalLanguage(text: string): Partial<CalendarEvent> | null {
    // Very basic parsing for demonstration purposes
    const lowerText = text.toLowerCase();
    
    let title = '';
    let start = new Date();
    let end = new Date();
    let isAllDay = false;
    
    // Attempt to extract title
    if (lowerText.includes('meeting with') || lowerText.includes('call with')) {
      const withIndex = Math.max(
        lowerText.indexOf('meeting with'), 
        lowerText.indexOf('call with')
      );
      
      if (withIndex !== -1) {
        const afterWith = lowerText.substring(withIndex).split(' ');
        if (afterWith.length >= 3) {
          title = afterWith.slice(0, 3).join(' ');
        }
      }
    } else {
      // Otherwise use first few words
      title = text.split(' ').slice(0, 3).join(' ');
    }
    
    // Extract date/time info
    if (lowerText.includes('tomorrow')) {
      start.setDate(start.getDate() + 1);
      end.setDate(end.getDate() + 1);
    } else if (lowerText.includes('next week')) {
      start.setDate(start.getDate() + 7);
      end.setDate(end.getDate() + 7);
    }
    
    // Extract time
    if (lowerText.includes('at ')) {
      const timeMatch = lowerText.match(/at (\d{1,2})(:\d{2})?\s*(am|pm)?/i);
      if (timeMatch) {
        let hour = parseInt(timeMatch[1]);
        const minute = timeMatch[2] ? parseInt(timeMatch[2].substring(1)) : 0;
        const ampm = timeMatch[3]?.toLowerCase();
        
        if (ampm === 'pm' && hour < 12) hour += 12;
        if (ampm === 'am' && hour === 12) hour = 0;
        
        start.setHours(hour, minute, 0, 0);
        end.setHours(hour + 1, minute, 0, 0);
      }
    } else if (lowerText.includes('all day')) {
      isAllDay = true;
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    }
    
    // Predict priority based on the text
    const priority = this.predictEventPriority(text);
    
    return {
      title: title || 'New Event',
      start,
      end,
      priority,
      isAllDay,
      type: 'event'
    };
  }
}

// Export a singleton instance
export const aiCalendarService = new AICalendarService();
