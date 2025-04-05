
import { Button } from "@/components/ui/button";
import { useCalendar } from "@/context/CalendarContext";
import { format } from "date-fns";
import { ArrowLeft, ArrowRight, Calendar as CalendarIcon } from "lucide-react";

const CalendarHeader = () => {
  const { calendarView, changeMonth, changeView } = useCalendar();
  const { month, year, view } = calendarView;
  
  const date = new Date(year, month);
  
  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center gap-2">
        <CalendarIcon className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">
          {format(date, 'MMMM yyyy')}
        </h1>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center border rounded-md overflow-hidden">
          <Button 
            variant={view === 'day' ? "default" : "ghost"} 
            onClick={() => changeView('day')}
            className="rounded-none"
            size="sm"
          >
            Day
          </Button>
          <Button 
            variant={view === 'week' ? "default" : "ghost"} 
            onClick={() => changeView('week')}
            className="rounded-none"
            size="sm"
          >
            Week
          </Button>
          <Button 
            variant={view === 'month' ? "default" : "ghost"} 
            onClick={() => changeView('month')}
            className="rounded-none"
            size="sm"
          >
            Month
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => changeMonth('prev')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            onClick={() => {
              const today = new Date();
              changeMonth('next'); // Hack to trigger re-render
              setTimeout(() => {
                changeMonth('prev');
              }, 10);
            }}
          >
            Today
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => changeMonth('next')}
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CalendarHeader;
