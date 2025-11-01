/**
 * A15: EVENT ATTENDANCE PREDICTION ALGORITHM
 * Predicts expected attendance for events based on historical data and signals
 */

interface EventFeatures {
  title: string;
  description: string;
  eventType: string;
  date: Date;
  price: number;
  venue: string;
  city: string;
  organizerId: number;
  capacity: number;
}

interface AttendancePrediction {
  predictedAttendance: number;
  confidence: number;
  range: { min: number; max: number };
  factors: { name: string; impact: string }[];
}

export class EventAttendancePredictionAlgorithm {
  async predictAttendance(
    event: EventFeatures,
    organizerHistory: any[],
    venueHistory: any[]
  ): Promise<AttendancePrediction> {
    const baselineAttendance = this.calculateBaseline(event, organizerHistory, venueHistory);
    const adjustedAttendance = this.applyFactors(baselineAttendance, event);
    const confidence = this.calculateConfidence(organizerHistory.length, venueHistory.length);

    return {
      predictedAttendance: Math.round(adjustedAttendance),
      confidence,
      range: {
        min: Math.round(adjustedAttendance * 0.7),
        max: Math.round(adjustedAttendance * 1.3),
      },
      factors: this.identifyFactors(event),
    };
  }

  private calculateBaseline(
    event: EventFeatures,
    organizerHistory: any[],
    venueHistory: any[]
  ): number {
    let baseline = 50; // Default baseline

    // Organizer track record (60% weight)
    if (organizerHistory.length > 0) {
      const avgOrganizerAttendance = this.average(
        organizerHistory.map(e => e.actualAttendance || 0)
      );
      baseline = avgOrganizerAttendance * 0.6 + baseline * 0.4;
    }

    // Venue track record (40% weight)
    if (venueHistory.length > 0) {
      const avgVenueAttendance = this.average(
        venueHistory.map(e => e.actualAttendance || 0)
      );
      baseline = baseline * 0.6 + avgVenueAttendance * 0.4;
    }

    return baseline;
  }

  private applyFactors(baseline: number, event: EventFeatures): number {
    let adjusted = baseline;

    // Event type multiplier
    const typeMultipliers: Record<string, number> = {
      'milonga': 1.0,
      'workshop': 0.8,
      'festival': 1.5,
      'class': 0.7,
      'practica': 0.6,
    };
    adjusted *= typeMultipliers[event.eventType.toLowerCase()] || 1.0;

    // Price factor
    if (event.price === 0) {
      adjusted *= 1.3; // Free events get 30% boost
    } else if (event.price > 50) {
      adjusted *= 0.7; // Expensive events get 30% penalty
    }

    // Timing factor
    const daysUntilEvent = this.daysBetween(new Date(), event.date);
    if (daysUntilEvent < 7) {
      adjusted *= 0.8; // Last minute events get less attendance
    } else if (daysUntilEvent > 90) {
      adjusted *= 0.9; // Too far out also reduces attendance
    }

    // Day of week factor
    const dayOfWeek = event.date.getDay();
    if (dayOfWeek === 5 || dayOfWeek === 6) {
      adjusted *= 1.2; // Weekend events 20% boost
    } else if (dayOfWeek === 0) {
      adjusted *= 1.1; // Sunday 10% boost
    }

    // Capacity constraint
    if (event.capacity > 0) {
      adjusted = Math.min(adjusted, event.capacity);
    }

    return adjusted;
  }

  private calculateConfidence(organizerEventsCount: number, venueEventsCount: number): number {
    const totalHistory = organizerEventsCount + venueEventsCount;
    
    if (totalHistory === 0) return 0.3;
    if (totalHistory < 5) return 0.5;
    if (totalHistory < 15) return 0.7;
    return 0.85;
  }

  private identifyFactors(event: EventFeatures): { name: string; impact: string }[] {
    const factors: { name: string; impact: string }[] = [];

    if (event.price === 0) {
      factors.push({ name: "Free admission", impact: "Positive (+30%)" });
    } else if (event.price > 50) {
      factors.push({ name: "High ticket price", impact: "Negative (-30%)" });
    }

    const dayOfWeek = event.date.getDay();
    if (dayOfWeek === 5 || dayOfWeek === 6) {
      factors.push({ name: "Weekend timing", impact: "Positive (+20%)" });
    }

    const daysUntil = this.daysBetween(new Date(), event.date);
    if (daysUntil < 7) {
      factors.push({ name: "Short notice", impact: "Negative (-20%)" });
    }

    if (event.eventType.toLowerCase() === 'festival') {
      factors.push({ name: "Festival format", impact: "Positive (+50%)" });
    }

    return factors;
  }

  private average(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
  }

  private daysBetween(date1: Date, date2: Date): number {
    const msPerDay = 24 * 60 * 60 * 1000;
    return Math.round((date2.getTime() - date1.getTime()) / msPerDay);
  }
}

export const eventAttendancePrediction = new EventAttendancePredictionAlgorithm();
