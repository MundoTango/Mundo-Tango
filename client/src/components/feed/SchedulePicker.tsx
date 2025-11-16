import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DayPicker } from 'react-day-picker';
import { Calendar, Clock, X } from 'lucide-react';
import { format } from 'date-fns';
import 'react-day-picker/dist/style.css';

interface SchedulePickerProps {
  scheduledFor: Date | null;
  onScheduledForChange: (date: Date | null) => void;
  className?: string;
}

export function SchedulePicker({ scheduledFor, onScheduledForChange, className = "" }: SchedulePickerProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(scheduledFor || undefined);
  const [selectedHour, setSelectedHour] = useState(scheduledFor ? scheduledFor.getHours() : 12);
  const [selectedMinute, setSelectedMinute] = useState(scheduledFor ? scheduledFor.getMinutes() : 0);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  const handleApply = () => {
    if (!selectedDate) return;

    const scheduled = new Date(selectedDate);
    scheduled.setHours(selectedHour, selectedMinute, 0, 0);

    if (scheduled <= new Date()) {
      // Schedule must be in the future
      return;
    }

    onScheduledForChange(scheduled);
    setShowPicker(false);
  };

  const handleClear = () => {
    onScheduledForChange(null);
    setSelectedDate(undefined);
    setShowPicker(false);
  };

  return (
    <div className={`relative ${className}`}>
      {!scheduledFor ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowPicker(!showPicker)}
          data-testid="button-schedule"
        >
          <Calendar className="h-4 w-4 mr-2" />
          Schedule Post
        </Button>
      ) : (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span data-testid="text-scheduled-for">
              Scheduled for {format(scheduledFor, 'PPP p')}
            </span>
          </div>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={handleClear}
            data-testid="button-clear-schedule"
            className="h-6 w-6"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {showPicker && (
        <Card className="absolute top-full mt-2 p-4 z-50" data-testid="card-schedule-picker">
          <div className="space-y-4">
            <div>
              <Label>Select Date</Label>
              <DayPicker
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={{ before: new Date() }}
                className="border rounded-md p-3"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Hour</Label>
                <Select
                  value={selectedHour.toString()}
                  onValueChange={(value) => setSelectedHour(parseInt(value))}
                >
                  <SelectTrigger data-testid="select-hour">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {hours.map((hour) => (
                      <SelectItem key={hour} value={hour.toString()}>
                        {hour.toString().padStart(2, '0')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Minute</Label>
                <Select
                  value={selectedMinute.toString()}
                  onValueChange={(value) => setSelectedMinute(parseInt(value))}
                >
                  <SelectTrigger data-testid="select-minute">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {minutes.filter(m => m % 5 === 0).map((minute) => (
                      <SelectItem key={minute} value={minute.toString()}>
                        {minute.toString().padStart(2, '0')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                onClick={handleApply}
                disabled={!selectedDate}
                className="flex-1"
                data-testid="button-apply-schedule"
              >
                Schedule
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPicker(false)}
                data-testid="button-cancel-schedule"
              >
                Cancel
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              Timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
