
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCalendar } from "@/context/CalendarContext";
import { useToast } from "@/components/ui/use-toast";
import { CalendarEvent } from "@/types/calendar";
import { useState } from "react";
import { SendIcon, RefreshCw } from "lucide-react";

const NaturalLanguageInput = () => {
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { parseNaturalLanguage, addEvent } = useCalendar();
  const { toast } = useToast();
  
  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    setIsProcessing(true);
    
    try {
      const parsedEvent = parseNaturalLanguage(input);
      
      if (parsedEvent && parsedEvent.title && parsedEvent.start && parsedEvent.end) {
        const eventToAdd: Omit<CalendarEvent, "id"> = {
          title: parsedEvent.title,
          start: parsedEvent.start,
          end: parsedEvent.end,
          priority: parsedEvent.priority || "medium",
          type: "event",
          description: `Created from: "${input}"`,
          isAllDay: parsedEvent.isAllDay
        };
        
        addEvent(eventToAdd);
        
        toast({
          title: "Event Created",
          description: `"${parsedEvent.title}" has been added to your calendar.`,
        });
        
        setInput("");
      } else {
        toast({
          title: "Couldn't Process Input",
          description: "Try being more specific with your event details.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an issue processing your request.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <form onSubmit={handleInputSubmit} className="flex gap-2 mb-6">
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Add event using natural language... (e.g., 'Meeting with Team tomorrow at 2pm')"
        className="flex-1"
      />
      <Button type="submit" disabled={isProcessing}>
        {isProcessing ? (
          <RefreshCw className="h-4 w-4 animate-spin" />
        ) : (
          <SendIcon className="h-4 w-4" />
        )}
        <span className="ml-2 hidden sm:inline">Add</span>
      </Button>
    </form>
  );
};

export default NaturalLanguageInput;
