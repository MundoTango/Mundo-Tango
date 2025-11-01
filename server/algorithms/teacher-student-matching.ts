/**
 * A19: TEACHER-STUDENT MATCHING ALGORITHM
 * Matches students with optimal teachers based on goals, level, location, availability
 */

interface StudentProfile {
  id: number;
  currentLevel: number; // 1-5
  goals: string[];
  preferredStyle: string[];
  budget: number;
  availability: number[]; // days of week
  location: string;
}

interface TeacherProfile {
  id: number;
  name: string;
  specialties: string[];
  teachingLevel: string; // 'beginner', 'intermediate', 'advanced', 'all'
  hourlyRate: number;
  availability: number[];
  location: string;
  rating: number;
  studentsCount: number;
}

interface TeacherMatch {
  teacherId: number;
  teacherName: string;
  matchScore: number;
  compatibility: number;
  reasons: string[];
  estimatedCost: number;
}

export class TeacherStudentMatchingAlgorithm {
  async findTeachers(
    student: StudentProfile,
    availableTeachers: TeacherProfile[]
  ): Promise<TeacherMatch[]> {
    return availableTeachers
      .map(teacher => this.scoreMatch(student, teacher))
      .filter(match => match.matchScore > 0.4)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10);
  }

  private scoreMatch(student: StudentProfile, teacher: TeacherProfile): TeacherMatch {
    let score = 0;
    const reasons: string[] = [];

    // Level compatibility (30%)
    const levelScore = this.calculateLevelMatch(student.currentLevel, teacher.teachingLevel);
    score += levelScore * 0.3;
    if (levelScore > 0.8) reasons.push("Perfect level match");

    // Style/specialty match (25%)
    const styleScore = this.calculateStyleMatch(student.goals, teacher.specialties);
    score += styleScore * 0.25;
    if (styleScore > 0.6) reasons.push("Teaches your preferred styles");

    // Location proximity (20%)
    const locationScore = student.location === teacher.location ? 1 : 0.3;
    score += locationScore * 0.2;
    if (locationScore === 1) reasons.push("Local teacher");

    // Schedule compatibility (15%)
    const scheduleScore = this.calculateScheduleMatch(student.availability, teacher.availability);
    score += scheduleScore * 0.15;
    if (scheduleScore > 0.6) reasons.push("Compatible schedule");

    // Budget fit (10%)
    const budgetScore = teacher.hourlyRate <= student.budget ? 1 : Math.max(0, 1 - (teacher.hourlyRate - student.budget) / student.budget);
    score += budgetScore * 0.1;
    if (budgetScore === 1) reasons.push("Within budget");

    // Teacher quality bonus
    if (teacher.rating >= 4.5) {
      score *= 1.1;
      reasons.push("Highly rated teacher");
    }

    return {
      teacherId: teacher.id,
      teacherName: teacher.name,
      matchScore: score,
      compatibility: Math.round(score * 100),
      reasons,
      estimatedCost: teacher.hourlyRate * 4, // 4 lessons per month
    };
  }

  private calculateLevelMatch(studentLevel: number, teachingLevel: string): number {
    if (teachingLevel === 'all') return 1.0;
    
    if (studentLevel <= 2 && teachingLevel === 'beginner') return 1.0;
    if (studentLevel >= 2 && studentLevel <= 4 && teachingLevel === 'intermediate') return 1.0;
    if (studentLevel >= 4 && teachingLevel === 'advanced') return 1.0;
    
    return 0.5;
  }

  private calculateStyleMatch(goals: string[], specialties: string[]): number {
    const matches = goals.filter(goal =>
      specialties.some(spec => spec.toLowerCase().includes(goal.toLowerCase()))
    );
    return goals.length > 0 ? matches.length / goals.length : 0.5;
  }

  private calculateScheduleMatch(studentDays: number[], teacherDays: number[]): number {
    const common = studentDays.filter(day => teacherDays.includes(day));
    return Math.min(common.length / 2, 1); // Need at least 2 common days for perfect match
  }
}

export const teacherStudentMatching = new TeacherStudentMatchingAlgorithm();
