
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useCalendar } from "@/context/CalendarContext";
import { formatEventTime } from "@/lib/calendarUtils";
import { format, isSameDay } from "date-fns";
import { Check, Plus, Sparkles } from "lucide-react";
import SettingsDialog from "./SettingsDialog";

const CalendarSidebar = () => {
  const { events, suggestions, focusBlocks, generateSuggestions } = useCalendar();
  
  const today = new Date();
  const todayEvents = events.filter(event => isSameDay(event.start, today));
  
  const handleGenerateSuggestions = () => {
    generateSuggestions();
  };
  
  return (
    <div className="w-full md:w-64 lg:w-80 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">AI Assistant</h2>
        <SettingsDialog />
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center">
            <Sparkles className="h-4 w-4 mr-2 text-yellow-500" />
            Suggestions
          </CardTitle>
          <CardDescription>AI-powered recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          {suggestions.length > 0 || focusBlocks.length > 0 ? (
            <div className="space-y-2">
              {suggestions.map(suggestion => (
                <div key={suggestion.id} className="bg-secondary/40 rounded-md p-3">
                  <div className="font-medium">{suggestion.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {formatEventTime(suggestion)}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Button size="sm" variant="default" className="w-full">
                      <Check className="h-3 w-3 mr-1" /> Accept
                    </Button>
                  </div>
                </div>
              ))}
              
              {focusBlocks.map(block => (
                <div key={block.id} className="bg-primary/10 rounded-md p-3">
                  <div className="font-medium">{block.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {format(block.start, "h:mm a")} - {format(block.end, "h:mm a")}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Button size="sm" variant="outline" className="w-full">
                      <Check className="h-3 w-3 mr-1" /> Add to Calendar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground text-sm mb-3">
                No suggestions available at the moment
              </p>
              <Button onClick={handleGenerateSuggestions} variant="outline" size="sm">
                Generate Suggestions
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Today's Schedule</CardTitle>
          <CardDescription>{format(today, "EEEE, MMMM d, yyyy")}</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[300px] px-4">
            {todayEvents.length > 0 ? (
              <div className="space-y-4">
                {todayEvents
                  .sort((a, b) => a.start.getTime() - b.start.getTime())
                  .map(event => (
                    <div key={event.id} className="border-l-4 pl-3 py-1" 
                      style={{ 
                        borderColor: event.priority === 'high' 
                          ? 'rgb(239, 68, 68)' 
                          : event.priority === 'medium' 
                            ? 'rgb(245, 158, 11)' 
                            : 'rgb(16, 185, 129)' 
                      }}
                    >
                      <div className="font-medium">{event.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatEventTime(event)}
                      </div>
                      {event.location && (
                        <div className="text-xs text-muted-foreground mt-1">
                          📍 {event.location}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No events scheduled for today</p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-2"
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Event
                </Button>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarSidebar;
