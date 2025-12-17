import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";

interface SchedulePostCalendarProps {
  onSchedule: (date: Date) => void;
  minDate?: Date;
}

export function SchedulePostCalendar({
  onSchedule,
  minDate = new Date(),
}: SchedulePostCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string>("12:00");

  const handleSchedule = () => {
    if (!selectedDate) return;

    const [hours, minutes] = selectedTime.split(":").map(Number);
    const scheduledDateTime = new Date(selectedDate);
    scheduledDateTime.setHours(hours, minutes, 0, 0);

    onSchedule(scheduledDateTime);
  };

  return (
    <Card
      style={{
        background: 'linear-gradient(135deg, rgba(10, 24, 40, 0.9) 0%, rgba(64, 224, 208, 0.1) 100%)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <CardHeader>
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-turquoise-500" />
          <CardTitle>Schedule Post</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-sm font-medium mb-2 block">Select Date</Label>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            disabled={(date) => date < minDate}
            className="rounded-md border border-white/10"
          />
        </div>

        <div>
          <Label htmlFor="schedule-time" className="text-sm font-medium mb-2 block flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Select Time
          </Label>
          <Input
            id="schedule-time"
            type="time"
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            className="bg-white/5 border-white/10"
          />
        </div>

        {selectedDate && (
          <div className="p-3 rounded-md bg-white/5 border border-white/10">
            <p className="text-sm text-muted-foreground">Scheduled for:</p>
            <p className="font-medium">
              {format(selectedDate, "MMMM d, yyyy")} at {selectedTime}
            </p>
          </div>
        )}

        <Button
          className="w-full"
          onClick={handleSchedule}
          disabled={!selectedDate}
          data-testid="button-schedule-post"
        >
          <CalendarIcon className="w-4 h-4 mr-2" />
          Schedule Post
        </Button>
      </CardContent>
    </Card>
  );
}
