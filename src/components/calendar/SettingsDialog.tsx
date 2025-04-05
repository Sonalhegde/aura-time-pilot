
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useCalendar } from "@/context/CalendarContext";
import { useState } from "react";
import { SettingsIcon } from "lucide-react";

const SettingsDialog = () => {
  const { settings, updateSettings } = useCalendar();
  const [localSettings, setLocalSettings] = useState({ ...settings });
  const [isOpen, setIsOpen] = useState(false);
  
  const handleOpenChange = (open: boolean) => {
    if (open) {
      setLocalSettings({ ...settings });
    }
    setIsOpen(open);
  };
  
  const handleSave = () => {
    updateSettings(localSettings);
    setIsOpen(false);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <SettingsIcon className="h-4 w-4" />
          <span>Settings</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Calendar Settings</DialogTitle>
          <DialogDescription>
            Customize how the AI calendar assistant works with your schedule
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="focusTime" className="flex flex-col">
                <span>Focus Time</span>
                <span className="text-sm text-muted-foreground">
                  Suggest dedicated focus periods
                </span>
              </Label>
              <Switch
                id="focusTime"
                checked={localSettings.enableFocusTime}
                onCheckedChange={(checked) =>
                  setLocalSettings({ ...localSettings, enableFocusTime: checked })
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="meetingSuggestions" className="flex flex-col">
                <span>Meeting Suggestions</span>
                <span className="text-sm text-muted-foreground">
                  Suggest optimal meeting times
                </span>
              </Label>
              <Switch
                id="meetingSuggestions"
                checked={localSettings.enableMeetingSuggestions}
                onCheckedChange={(checked) =>
                  setLocalSettings({ ...localSettings, enableMeetingSuggestions: checked })
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="priorityAssignment" className="flex flex-col">
                <span>Priority Assignment</span>
                <span className="text-sm text-muted-foreground">
                  Automatically assign priorities to events
                </span>
              </Label>
              <Switch
                id="priorityAssignment"
                checked={localSettings.enablePriorityAssignment}
                onCheckedChange={(checked) =>
                  setLocalSettings({ ...localSettings, enablePriorityAssignment: checked })
                }
              />
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label>Working Hours</Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="workStart" className="text-sm">
                  Start Time
                </Label>
                <Input
                  id="workStart"
                  type="time"
                  value={localSettings.workingHours.start}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      workingHours: {
                        ...localSettings.workingHours,
                        start: e.target.value
                      }
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="workEnd" className="text-sm">
                  End Time
                </Label>
                <Input
                  id="workEnd"
                  type="time"
                  value={localSettings.workingHours.end}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      workingHours: {
                        ...localSettings.workingHours,
                        end: e.target.value
                      }
                    })
                  }
                />
              </div>
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="meetingDuration">Preferred Meeting Duration</Label>
            <Select
              value={localSettings.preferredMeetingDuration.toString()}
              onValueChange={(value) =>
                setLocalSettings({
                  ...localSettings,
                  preferredMeetingDuration: parseInt(value)
                })
              }
            >
              <SelectTrigger id="meetingDuration">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="45">45 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="90">1.5 hours</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="focusPreference">Focus Time Preference</Label>
            <Select
              value={localSettings.focusTimePreference}
              onValueChange={(value) =>
                setLocalSettings({
                  ...localSettings,
                  focusTimePreference: value as 'morning' | 'afternoon' | 'custom'
                })
              }
            >
              <SelectTrigger id="focusPreference">
                <SelectValue placeholder="Select preference" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="morning">Morning Focus</SelectItem>
                <SelectItem value="afternoon">Afternoon Focus</SelectItem>
                <SelectItem value="custom">Custom Schedule</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;
