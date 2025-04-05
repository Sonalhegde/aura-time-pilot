
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCalendar } from "@/context/CalendarContext";
import { generateTimeSlots } from "@/lib/calendarUtils";
import { CalendarEvent, EventPriority } from "@/types/calendar";
import { addDays, format } from "date-fns";
import { ClockIcon, MapPinIcon, UsersIcon, XIcon } from "lucide-react";
import { useEffect, useState } from "react";

interface EventDialogProps {
  event: CalendarEvent | null;
  date: Date | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EventDialog = ({ event, date, open, onOpenChange }: EventDialogProps) => {
  const { addEvent, updateEvent, deleteEvent } = useCalendar();
  const isEditing = !!event;
  const isNewEvent = !event && !!date;
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [priority, setPriority] = useState<EventPriority>("medium");
  const [location, setLocation] = useState("");
  const [participants, setParticipants] = useState("");
  
  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDescription(event.description || "");
      setStartDate(format(event.start, "yyyy-MM-dd"));
      setStartTime(format(event.start, "HH:mm"));
      setEndTime(format(event.end, "HH:mm"));
      setPriority(event.priority);
      setLocation(event.location || "");
      setParticipants(event.participants?.join(", ") || "");
    } else if (date) {
      setTitle("");
      setDescription("");
      setStartDate(format(date, "yyyy-MM-dd"));
      setStartTime("09:00");
      setEndTime("10:00");
      setPriority("medium");
      setLocation("");
      setParticipants("");
    }
  }, [event, date, open]);
  
  const handleSave = () => {
    // Parse dates
    const startDateTime = new Date(`${startDate}T${startTime}`);
    const endDateTime = new Date(`${startDate}T${endTime}`);
    
    // Ensure end time is after start time (move to next day if needed)
    if (endDateTime <= startDateTime) {
      endDateTime.setTime(addDays(startDateTime, 1).getTime());
    }
    
    const participantsList = participants
      .split(",")
      .map(p => p.trim())
      .filter(p => p !== "");
    
    const eventData = {
      title,
      description,
      start: startDateTime,
      end: endDateTime,
      priority,
      location: location || undefined,
      participants: participantsList.length > 0 ? participantsList : undefined,
      type: 'event' as const,
    };
    
    if (isEditing && event) {
      updateEvent({ ...eventData, id: event.id });
    } else {
      addEvent(eventData);
    }
    
    onOpenChange(false);
  };
  
  const handleDelete = () => {
    if (event) {
      deleteEvent(event.id);
      onOpenChange(false);
    }
  };
  
  // Generate time slots for select dropdowns
  const timeSlots = generateTimeSlots("00:00", "23:30", 30);
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Event" : "New Event"}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Make changes to your event here."
              : "Fill in the details for your new event."
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Event title"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="start-time">Start Time</Label>
              <Select value={startTime} onValueChange={setStartTime}>
                <SelectTrigger id="start-time" className="w-full">
                  <SelectValue placeholder="Start time" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((time) => (
                    <SelectItem key={`start-${time}`} value={time}>
                      {format(new Date(`2000-01-01T${time}`), "h:mm a")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="end-time">End Time</Label>
              <Select value={endTime} onValueChange={setEndTime}>
                <SelectTrigger id="end-time" className="w-full">
                  <SelectValue placeholder="End time" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((time) => (
                    <SelectItem key={`end-${time}`} value={time}>
                      {format(new Date(`2000-01-01T${time}`), "h:mm a")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="priority">Priority</Label>
            <Select value={priority} onValueChange={(value) => setPriority(value as EventPriority)}>
              <SelectTrigger id="priority" className="w-full">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Event description"
              rows={3}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="location" className="flex items-center gap-2">
              <MapPinIcon className="h-4 w-4" /> Location
            </Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Event location"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="participants" className="flex items-center gap-2">
              <UsersIcon className="h-4 w-4" /> Participants
            </Label>
            <Input
              id="participants"
              value={participants}
              onChange={(e) => setParticipants(e.target.value)}
              placeholder="Comma-separated list of participants"
            />
          </div>
        </div>
        
        <DialogFooter className="flex justify-between sm:justify-between">
          {isEditing && (
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {isEditing ? "Save Changes" : "Create Event"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EventDialog;
