
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCalendar } from "@/context/CalendarContext";
import { format, getDay, isAfter, isBefore, isSameDay, startOfWeek } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const AnalyticsDashboard = () => {
  const { events } = useCalendar();
  
  // Calculate time spent in meetings per day of week
  const calculateMeetingsByDay = () => {
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayCountsMinutes = Array(7).fill(0);
    
    events.forEach(event => {
      if (event.type === 'event') { // Only count regular events, not focus time
        const dayOfWeek = getDay(event.start);
        const durationMinutes = (event.end.getTime() - event.start.getTime()) / (1000 * 60);
        dayCountsMinutes[dayOfWeek] += durationMinutes;
      }
    });
    
    return dayNames.map((name, index) => ({
      name: name.substring(0, 3), // Abbreviate day name
      hours: Math.round(dayCountsMinutes[index] / 60 * 10) / 10, // Convert to hours with 1 decimal
    }));
  };
  
  // Calculate events by priority
  const calculateEventsByPriority = () => {
    const priorityCounts = { high: 0, medium: 0, low: 0 };
    
    events.forEach(event => {
      priorityCounts[event.priority]++;
    });
    
    return [
      { name: "High", value: priorityCounts.high, color: "#ef4444" },
      { name: "Medium", value: priorityCounts.medium, color: "#f59e0b" },
      { name: "Low", value: priorityCounts.low, color: "#10b981" },
    ];
  };
  
  // Calculate upcoming events
  const getUpcomingEvents = () => {
    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    return events
      .filter(event => isAfter(event.start, now) && isBefore(event.start, nextWeek))
      .sort((a, b) => a.start.getTime() - b.start.getTime())
      .slice(0, 5);
  };
  
  // Data for the charts
  const meetingsByDay = calculateMeetingsByDay();
  const eventsByPriority = calculateEventsByPriority();
  const upcomingEvents = getUpcomingEvents();
  
  return (
    <Tabs defaultValue="summary" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="summary">Summary</TabsTrigger>
        <TabsTrigger value="time">Time Analysis</TabsTrigger>
        <TabsTrigger value="priorities">Priorities</TabsTrigger>
      </TabsList>
      
      <TabsContent value="summary" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Meeting Distribution</CardTitle>
              <CardDescription>Hours spent in meetings by day</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={meetingsByDay}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="hours" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Event Priorities</CardTitle>
              <CardDescription>Distribution of event priorities</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={eventsByPriority}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => 
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {eventsByPriority.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Upcoming Events</CardTitle>
            <CardDescription>Your schedule for the next week</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingEvents.length > 0 ? (
              <div className="space-y-3">
                {upcomingEvents.map(event => (
                  <div 
                    key={event.id} 
                    className="flex justify-between items-center border-b pb-2"
                  >
                    <div>
                      <div className="font-medium">{event.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {format(event.start, "MMM d, yyyy • h:mm a")}
                      </div>
                    </div>
                    <div 
                      className={`rounded-full h-3 w-3 ${
                        event.priority === 'high' 
                          ? 'bg-red-500' 
                          : event.priority === 'medium' 
                            ? 'bg-amber-500' 
                            : 'bg-green-500'
                      }`}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground">No upcoming events for the next week</p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="time" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Time Usage Insights</CardTitle>
            <CardDescription>Analysis of how your time is spent</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-lg text-muted-foreground py-6">
              More detailed time analysis will be available in the next version.
            </p>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="priorities" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Priority Management</CardTitle>
            <CardDescription>How well you manage your priorities</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-lg text-muted-foreground py-6">
              Detailed priority insights will be available in the next version.
            </p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default AnalyticsDashboard;
