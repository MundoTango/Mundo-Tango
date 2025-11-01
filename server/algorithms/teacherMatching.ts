/**
 * A21: Teacher-Student Matching Agent
 * 
 * Matches students with teachers based on skill level, teaching style,
 * location, availability, and compatibility
 */

export interface TeacherMatch {
  teacherId: number;
  score: number;
  reasons: string[];
  distanceKm?: number;
  availability: string[];
}

interface Teacher {
  id: number;
  name: string;
  specialties: string[];
  teachingLevel: ('beginner' | 'intermediate' | 'advanced')[];
  teachingStyle?: string;
  latitude?: number;
  longitude?: number;
  cityName?: string;
  availability: string[]; // e.g., ['monday-evening', 'saturday-morning']
  rating?: number;
  studentsCount?: number;
  pricePerHour?: number;
}

interface StudentProfile {
  id: number;
  currentLevel: 'beginner' | 'intermediate' | 'advanced';
  goals: string[];
  preferredStyle?: string;
  latitude?: number;
  longitude?: number;
  cityName?: string;
  availability: string[];
  budget?: number;
}

/**
 * Calculate distance between coordinates
 */
function calculateDistance(
  lat1?: number,
  lon1?: number,
  lat2?: number,
  lon2?: number
): number | null {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Check if teacher can teach at student's level
 */
function calculateLevelMatch(
  studentLevel: string,
  teacherLevels: string[]
): number {
  if (teacherLevels.includes(studentLevel)) return 1.0;
  
  // Partial match if teacher can teach adjacent levels
  const levels = ['beginner', 'intermediate', 'advanced'];
  const studentIndex = levels.indexOf(studentLevel);
  
  for (const teacherLevel of teacherLevels) {
    const teacherIndex = levels.indexOf(teacherLevel);
    if (Math.abs(teacherIndex - studentIndex) === 1) {
      return 0.7; // Adjacent level
    }
  }
  
  return 0.3; // Can work but not ideal
}

/**
 * Match student goals with teacher specialties
 */
function calculateSpecialtyMatch(
  studentGoals: string[],
  teacherSpecialties: string[]
): { score: number; matchedCount: number } {
  if (studentGoals.length === 0 || teacherSpecialties.length === 0) {
    return { score: 0.5, matchedCount: 0 };
  }
  
  const matchedGoals = studentGoals.filter(goal => 
    teacherSpecialties.some(specialty => 
      specialty.toLowerCase().includes(goal.toLowerCase()) ||
      goal.toLowerCase().includes(specialty.toLowerCase())
    )
  );
  
  const score = matchedGoals.length / studentGoals.length;
  return {
    score,
    matchedCount: matchedGoals.length
  };
}

/**
 * Check availability overlap
 */
function calculateAvailabilityMatch(
  studentAvailability: string[],
  teacherAvailability: string[]
): { score: number; overlapping: string[] } {
  if (studentAvailability.length === 0 || teacherAvailability.length === 0) {
    return { score: 0.5, overlapping: [] };
  }
  
  const overlapping = studentAvailability.filter(slot => 
    teacherAvailability.includes(slot)
  );
  
  const score = overlapping.length / studentAvailability.length;
  return {
    score,
    overlapping
  };
}

/**
 * Score based on teaching style compatibility
 */
function calculateStyleMatch(
  studentPreference?: string,
  teacherStyle?: string
): number {
  if (!studentPreference || !teacherStyle) return 0.5;
  
  const match = studentPreference.toLowerCase() === teacherStyle.toLowerCase();
  return match ? 1.0 : 0.3;
}

/**
 * Score based on location proximity
 */
function calculateLocationScore(
  distanceKm: number | null,
  sameCity: boolean
): number {
  if (sameCity) return 1.0;
  if (distanceKm === null) return 0.5;
  
  // Exponential decay: 1.0 at 0km, 0.5 at 10km, near 0 at 50km
  return Math.exp(-distanceKm / 10);
}

/**
 * Score based on teacher rating and experience
 */
function calculateQualityScore(
  rating?: number,
  studentsCount?: number
): number {
  const ratingScore = rating ? rating / 5 : 0.5;
  const experienceScore = studentsCount 
    ? Math.min(1, Math.log1p(studentsCount) / Math.log1p(50))
    : 0.5;
  
  return (ratingScore * 0.7) + (experienceScore * 0.3);
}

/**
 * Check if teacher fits student's budget
 */
function calculateBudgetFit(
  teacherPrice?: number,
  studentBudget?: number
): number {
  if (!teacherPrice || !studentBudget) return 0.5;
  
  if (teacherPrice <= studentBudget) return 1.0;
  
  // Partial score if slightly over budget
  const overagRatio = teacherPrice / studentBudget;
  if (overagRatio <= 1.2) return 0.7; // Up to 20% over
  if (overagRatio <= 1.5) return 0.4; // Up to 50% over
  
  return 0.1; // Significantly over budget
}

/**
 * Main teacher matching function
 */
export function matchTeachers(
  student: StudentProfile,
  teachers: Teacher[],
  options: {
    maxDistance?: number;
    requireAvailabilityMatch?: boolean;
    limit?: number;
    minScore?: number;
  } = {}
): TeacherMatch[] {
  const {
    maxDistance = 50,
    requireAvailabilityMatch = false,
    limit = 10,
    minScore = 0.4
  } = options;
  
  const matches: TeacherMatch[] = [];
  
  for (const teacher of teachers) {
    const reasons: string[] = [];
    
    // Calculate distance and location match
    const sameCity = student.cityName === teacher.cityName && !!student.cityName;
    const distanceKm = calculateDistance(
      student.latitude,
      student.longitude,
      teacher.latitude,
      teacher.longitude
    );
    
    // Filter by max distance
    if (distanceKm !== null && distanceKm > maxDistance) {
      continue;
    }
    
    // Calculate component scores
    const levelScore = calculateLevelMatch(student.currentLevel, teacher.teachingLevel);
    const specialtyMatch = calculateSpecialtyMatch(student.goals, teacher.specialties);
    const availabilityMatch = calculateAvailabilityMatch(
      student.availability,
      teacher.availability
    );
    const styleScore = calculateStyleMatch(student.preferredStyle, teacher.teachingStyle);
    const locationScore = calculateLocationScore(distanceKm, sameCity);
    const qualityScore = calculateQualityScore(teacher.rating, teacher.studentsCount);
    const budgetScore = calculateBudgetFit(teacher.pricePerHour, student.budget);
    
    // Skip if required availability match doesn't exist
    if (requireAvailabilityMatch && availabilityMatch.overlapping.length === 0) {
      continue;
    }
    
    // Weighted combination
    const LEVEL_WEIGHT = 0.25;
    const SPECIALTY_WEIGHT = 0.20;
    const AVAILABILITY_WEIGHT = 0.15;
    const LOCATION_WEIGHT = 0.15;
    const QUALITY_WEIGHT = 0.10;
    const STYLE_WEIGHT = 0.10;
    const BUDGET_WEIGHT = 0.05;
    
    const finalScore = 
      (LEVEL_WEIGHT * levelScore) +
      (SPECIALTY_WEIGHT * specialtyMatch.score) +
      (AVAILABILITY_WEIGHT * availabilityMatch.score) +
      (LOCATION_WEIGHT * locationScore) +
      (QUALITY_WEIGHT * qualityScore) +
      (STYLE_WEIGHT * styleScore) +
      (BUDGET_WEIGHT * budgetScore);
    
    // Build reasons list
    if (levelScore === 1.0) {
      reasons.push(`Teaches ${student.currentLevel} level`);
    }
    if (specialtyMatch.matchedCount > 0) {
      reasons.push(`Specializes in your goals`);
    }
    if (availabilityMatch.overlapping.length > 0) {
      reasons.push(`${availabilityMatch.overlapping.length} matching time slot${availabilityMatch.overlapping.length > 1 ? 's' : ''}`);
    }
    if (sameCity) {
      reasons.push('In your city');
    } else if (distanceKm !== null && distanceKm < 10) {
      reasons.push(`Nearby (${distanceKm.toFixed(1)}km)`);
    }
    if (teacher.rating && teacher.rating >= 4.5) {
      reasons.push(`Highly rated (${teacher.rating.toFixed(1)}/5)`);
    }
    if (budgetScore === 1.0) {
      reasons.push('Within budget');
    }
    
    // Only include if meets minimum score
    if (finalScore >= minScore) {
      matches.push({
        teacherId: teacher.id,
        score: finalScore,
        reasons,
        distanceKm: distanceKm || undefined,
        availability: availabilityMatch.overlapping
      });
    }
  }
  
  // Sort by score descending
  matches.sort((a, b) => b.score - a.score);
  
  // Apply limit
  return matches.slice(0, limit);
}
