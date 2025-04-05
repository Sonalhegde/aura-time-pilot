
import CalendarHeader from "@/components/calendar/CalendarHeader";
import CalendarMonthView from "@/components/calendar/CalendarMonthView";
import CalendarSidebar from "@/components/calendar/CalendarSidebar";
import NaturalLanguageInput from "@/components/calendar/NaturalLanguageInput";
import AnalyticsDashboard from "@/components/calendar/AnalyticsDashboard";
import { Separator } from "@/components/ui/separator";
import { CalendarProvider } from "@/context/CalendarContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  return (
    <CalendarProvider>
      <div className="min-h-screen bg-background">
        <div className="container py-6 max-w-[1400px]">
          <div className="flex flex-col space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Aura Time Pilot</h1>
              <p className="text-muted-foreground">
                Smart AI-powered calendar for optimal time management
              </p>
            </div>
            
            <Tabs defaultValue="calendar">
              <TabsList>
                <TabsTrigger value="calendar">Calendar</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>
              
              <TabsContent value="calendar">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1 space-y-4">
                    <NaturalLanguageInput />
                    <CalendarHeader />
                    <CalendarMonthView />
                  </div>
                  
                  <Separator orientation="vertical" className="hidden md:block" />
                  <Separator className="block md:hidden" />
                  
                  <CalendarSidebar />
                </div>
              </TabsContent>
              
              <TabsContent value="analytics">
                <div className="py-4">
                  <AnalyticsDashboard />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </CalendarProvider>
  );
};

export default Index;
