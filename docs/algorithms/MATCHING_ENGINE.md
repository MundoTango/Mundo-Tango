# Matching Engine Algorithms

**Version:** 1.0  
**Last Updated:** November 2, 2025  
**Status:** Production  
**Owner:** Matching & Recommendation Team  

---

## Table of Contents

1. [Overview](#overview)
2. [Partner Matching (Dance Partner)](#1-partner-matching-dance-partner)
3. [Housing Match](#2-housing-match)
4. [Talent Match](#3-talent-match)
5. [Teacher-Student Pairing](#4-teacher-student-pairing)
6. [Roommate Matching](#5-roommate-matching)
7. [Mentor Matching](#6-mentor-matching)
8. [Workshop Recommendation](#7-workshop-recommendation)
9. [Venue Recommendation](#8-venue-recommendation)
10. [Carpool Matching](#9-carpool-matching)
11. [Language Partner](#10-language-partner)
12. [Practice Partner](#11-practice-partner)
13. [Event Buddy](#12-event-buddy)
14. [Collaboration Match](#13-collaboration-match)
15. [Network Expansion](#14-network-expansion)
16. [Cultural Fit Score](#15-cultural-fit-score)

---

## Overview

The Matching Engine powers intelligent pairing and recommendations across the Mundo Tango platform. Using multi-factor scoring, collaborative filtering, and graph algorithms, these systems connect users with compatible partners, suitable housing, ideal teachers, and meaningful opportunities.

### Core Capabilities

- **Multi-dimensional Scoring**: Combines skill, location, personality, and preferences
- **Preference Learning**: Adapts to user feedback over time
- **Constraint Satisfaction**: Respects hard requirements (availability, budget, etc.)
- **Network Effects**: Leverages social graph for enhanced matching
- **Real-time Recommendations**: Sub-second response times for interactive experiences

---

## 1. Partner Matching (Dance Partner)

### Purpose
Match dancers based on skill level, role preferences, location, availability, and dance goals.

### Algorithm

(Documented in server/algorithms/dance-partner-matching.ts - see lines 1-193)

**Summary**: Multi-factor weighted scoring across role compatibility (25%), skill match (20%), location proximity (20%), schedule overlap (15%), music preferences (10%), and goals alignment (10%).

**Key Innovation**: Role complementarity detection (leader/follower pairing)

### Pseudocode

```pseudocode
FUNCTION matchDancePartners(dancer, candidates, limit=10):
    scored_matches = []
    
    FOR EACH partner IN candidates DO
        IF partner.id == dancer.id THEN CONTINUE  // Skip self
        
        scores = {
            role: calculateRoleCompatibility(dancer, partner),
            skill: calculateSkillMatch(dancer, partner),
            location: calculateLocationMatch(dancer, partner),
            schedule: calculateScheduleMatch(dancer, partner),
            music: calculateMusicMatch(dancer, partner),
            goals: calculateGoalsMatch(dancer, partner)
        }
        
        // Weighted combination
        final_score = 
            (scores.role × 0.25) +
            (scores.skill × 0.20) +
            (scores.location × 0.20) +
            (scores.schedule × 0.15) +
            (scores.music × 0.10) +
            (scores.goals × 0.10)
        
        scored_matches.append({
            partnerId: partner.id,
            score: final_score,
            compatibility: round(final_score × 100),
            breakdown: scores,
            matchReasons: generateMatchReasons(scores),
            challenges: identifyPotentialChallenges(scores)
        })
    END FOR
    
    SORT scored_matches BY score DESC
    RETURN scored_matches[0:limit]
END FUNCTION

FUNCTION calculateRoleCompatibility(dancer, partner):
    dancer_leads = 'leader' IN dancer.preferredRoles OR 'both' IN dancer.preferredRoles
    dancer_follows = 'follower' IN dancer.preferredRoles OR 'both' IN dancer.preferredRoles
    partner_leads = 'leader' IN partner.preferredRoles OR 'both' IN partner.preferredRoles
    partner_follows = 'follower' IN partner.preferredRoles OR 'both' IN partner.preferredRoles
    
    // Perfect complementary roles
    IF (dancer_leads AND partner_follows) OR (dancer_follows AND partner_leads) THEN
        RETURN 1.0
    END IF
    
    // Both dance both roles (very flexible)
    IF 'both' IN dancer.preferredRoles AND 'both' IN partner.preferredRoles THEN
        RETURN 0.9
    END IF
    
    // One dances both, one specific
    IF 'both' IN dancer.preferredRoles OR 'both' IN partner.preferredRoles THEN
        RETURN 0.7
    END IF
    
    // Same role (less ideal)
    RETURN 0.3
END FUNCTION

FUNCTION calculateSkillMatch(dancer, partner):
    dancer_skill = max(dancer.leaderLevel, dancer.followerLevel)
    partner_skill = max(partner.leaderLevel, partner.followerLevel)
    
    diff = abs(dancer_skill - partner_skill)
    
    // Same level = perfect
    IF diff == 0 THEN RETURN 1.0
    // 1 level diff = good
    ELSE IF diff == 1 THEN RETURN 0.8
    // 2 levels diff = acceptable
    ELSE IF diff == 2 THEN RETURN 0.5
    // 3+ levels diff = challenging
    ELSE RETURN 0.2
    END IF
END FUNCTION
```

### Complexity Analysis

- **Time Complexity**: O(n × (r + m + g)) where n = candidates, r = roles, m = music prefs, g = goals
- **Space Complexity**: O(n) for scored matches
- **Optimization**: Pre-filter by hard constraints (city, availability)

### Edge Cases

1. **Beginner Seeking Advanced**: Still matches but flags skill gap
2. **No Location Data**: Falls back to city-level matching
3. **No Common Availability**: Returns match with warning
4. **Single Role Preference**: Requires complementary partner role

### Example Input/Output

**Input:**
```typescript
dancer: {
  leaderLevel: 3,
  followerLevel: 2,
  preferredRoles: ['leader'],
  city: 'Buenos Aires',
  availableDays: [2, 4, 6],  // Tuesday, Thursday, Saturday
  musicPreferences: ['traditional', 'nuevo'],
  goals: ['social', 'performance']
}
```

**Output:**
```typescript
[
  {
    partnerId: 45,
    score: 0.87,
    compatibility: 87,
    breakdown: {
      role: 1.0,      // Complementary leader/follower
      skill: 0.8,     // 1 level difference
      location: 1.0,  // Same city
      schedule: 0.67, // 2/3 days match
      music: 0.5,     // Some overlap
      goals: 1.0      // Aligned
    },
    matchReasons: [
      "Perfect role compatibility",
      "Similar skill levels",
      "Same city",
      "Compatible schedules"
    ],
    challenges: []
  }
]
```

---

## 2. Housing Match

### Purpose
Connect hosts offering tango-themed accommodation with travelers seeking authentic experiences.

### Algorithm

```pseudocode
FUNCTION matchHousing(traveler, listings, filters):
    scored_listings = []
    
    FOR EACH listing IN listings DO
        // Apply hard filters first
        IF NOT meetsFilters(listing, filters) THEN
            CONTINUE
        END IF
        
        score = 0
        
        // Factor 1: Price Match (30%)
        price_score = scorePriceFit(listing.price, traveler.budget)
        score += price_score × 0.30
        
        // Factor 2: Location Desirability (25%)
        location_score = scoreLocation(listing, traveler.preferences)
        score += location_score × 0.25
        
        // Factor 3: Amenities Match (20%)
        amenities_score = scoreAmenities(listing.amenities, traveler.required)
        score += amenities_score × 0.20
        
        // Factor 4: Host Compatibility (15%)
        host_score = scoreHostCompatibility(listing.host, traveler)
        score += host_score × 0.15
        
        // Factor 5: Reviews & Rating (10%)
        reputation_score = listing.rating / 5
        score += reputation_score × 0.10
        
        scored_listings.append({
            listingId: listing.id,
            score: score,
            pricePerNight: listing.price,
            distance: calculateDistance(listing, traveler.destination),
            highlights: generateHighlights(listing, traveler)
        })
    END FOR
    
    SORT scored_listings BY score DESC
    RETURN scored_listings[0:20]
END FUNCTION

FUNCTION scorePriceFit(listing_price, budget):
    IF budget == 0 THEN RETURN 0.5  // No budget set
    
    IF listing_price <= budget THEN
        // Within budget, favor mid-range
        ratio = listing_price / budget
        IF ratio > 0.7 THEN RETURN 1.0      // Good value
        ELSE IF ratio > 0.4 THEN RETURN 0.9 // Budget option
        ELSE RETURN 0.7                      // Very cheap (quality concern)
        END IF
    ELSE
        // Over budget
        overage = (listing_price - budget) / budget
        IF overage < 0.2 THEN RETURN 0.6    // Slightly over
        ELSE IF overage < 0.5 THEN RETURN 0.3  // Moderately over
        ELSE RETURN 0.1                        // Way over
        END IF
    END IF
END FUNCTION

FUNCTION scoreLocation(listing, preferences):
    score = 0.5  // Base score
    
    // Proximity to milongas/studios
    nearby_venues = countNearbyVenues(listing.location, 2_KM)
    IF nearby_venues >= 5 THEN
        score += 0.3
    ELSE IF nearby_venues >= 2 THEN
        score += 0.2
    END IF
    
    // Walkability/Transit
    IF listing.transitScore >= 80 THEN
        score += 0.2
    ELSE IF listing.transitScore >= 60 THEN
        score += 0.1
    END IF
    
    // Neighborhood safety
    IF listing.neighborhoodSafety >= 4 THEN
        score += 0.1
    END IF
    
    RETURN min(score, 1.0)
END FUNCTION

FUNCTION scoreHostCompatibility(host, traveler):
    compatibility = 0.5
    
    // Language match
    common_languages = intersect(host.languages, traveler.languages)
    IF length(common_languages) > 0 THEN
        compatibility += 0.3
    END IF
    
    // Shared interests
    IF 'tango' IN host.interests AND 'tango' IN traveler.interests THEN
        compatibility += 0.2
    END IF
    
    // Host experience
    IF host.yearsHosting > 2 THEN
        compatibility += 0.1
    END IF
    
    RETURN min(compatibility, 1.0)
END FUNCTION

FUNCTION meetsFilters(listing, filters):
    // Hard constraints
    IF filters.maxPrice > 0 AND listing.price > filters.maxPrice THEN
        RETURN false
    END IF
    
    IF filters.minRating > 0 AND listing.rating < filters.minRating THEN
        RETURN false
    END IF
    
    // Required amenities
    FOR EACH required IN filters.requiredAmenities DO
        IF required NOT IN listing.amenities THEN
            RETURN false
        END IF
    END FOR
    
    // Availability
    IF NOT listing.available(filters.checkIn, filters.checkOut) THEN
        RETURN false
    END IF
    
    RETURN true
END FUNCTION
```

### Complexity Analysis

- **Time Complexity**: O(n × (a + v)) where n = listings, a = amenities, v = nearby venues
- **Space Complexity**: O(n) for scored results
- **Database**: Spatial queries for venue proximity

### Edge Cases

1. **No Budget Specified**: Assumes mid-range preferences
2. **Remote Location**: Location score adjusts for proximity to transit
3. **New Host**: Minimal reviews → lower reputation score
4. **Fully Booked**: Pre-filtered in availability check

### Example Input/Output

**Input:**
```typescript
traveler: {
  budget: 60,
  destination: {latitude: -34.6037, longitude: -58.3816},
  required: ['wifi', 'kitchen'],
  languages: ['English', 'Spanish'],
  checkIn: '2025-11-15',
  checkOut: '2025-11-22'
}
```

**Output:**
```typescript
[
  {
    listingId: 123,
    score: 0.88,
    pricePerNight: 55,
    distance: 1.2,  // km from destination
    highlights: [
      "Walking distance to 5 milongas",
      "Host speaks English and Spanish",
      "Excellent transit access",
      "4.8★ from 45 reviews"
    ]
  }
]
```

---

## 3. Talent Match

### Purpose
Connect organizers with talented performers, DJs, and instructors for events.

### Algorithm

```pseudocode
FUNCTION matchTalent(event_needs, talent_pool):
    matches = []
    
    FOR EACH talent IN talent_pool DO
        // Check basic eligibility
        IF NOT isEligible(talent, event_needs) THEN
            CONTINUE
        END IF
        
        score = 0
        
        // Factor 1: Specialty Alignment (35%)
        specialty_score = scoreSpecialty(talent.specialties, event_needs.required_skills)
        score += specialty_score × 0.35
        
        // Factor 2: Experience Level (25%)
        experience_score = scoreExperience(talent, event_needs.event_size)
        score += experience_score × 0.25
        
        // Factor 3: Availability (20%)
        availability_score = talent.isAvailable(event_needs.date) ? 1.0 : 0.0
        score += availability_score × 0.20
        
        // Factor 4: Reputation (15%)
        reputation_score = min(talent.rating / 5, 1.0)
        score += reputation_score × 0.15
        
        // Factor 5: Budget Fit (5%)
        budget_score = scoreBudgetFit(talent.rate, event_needs.budget)
        score += budget_score × 0.05
        
        matches.append({
            talentId: talent.id,
            name: talent.name,
            score: score,
            rate: talent.rate,
            availability: availability_score,
            portfolio: talent.portfolio_url,
            reasons: generateTalentReasons(talent, event_needs, specialty_score)
        })
    END FOR
    
    SORT matches BY score DESC
    RETURN matches[0:15]
END FUNCTION

FUNCTION scoreSpecialty(talent_specialties, required_skills):
    IF isEmpty(required_skills) THEN
        RETURN 0.5
    END IF
    
    matched_count = 0
    FOR EACH skill IN required_skills DO
        FOR EACH specialty IN talent_specialties DO
            IF contains(toLowerCase(specialty), toLowerCase(skill)) THEN
                matched_count += 1
                BREAK
            END IF
        END FOR
    END FOR
    
    RETURN matched_count / length(required_skills)
END FUNCTION

FUNCTION scoreExperience(talent, event_size):
    // Match experience to event size
    years = talent.yearsOfExperience
    past_events = talent.eventsPerformed
    
    IF event_size == 'small' THEN  // < 50 people
        IF years >= 1 THEN RETURN 1.0
        ELSE RETURN 0.5
        END IF
    ELSE IF event_size == 'medium' THEN  // 50-200
        IF years >= 3 AND past_events >= 20 THEN RETURN 1.0
        ELSE IF years >= 2 THEN RETURN 0.7
        ELSE RETURN 0.4
        END IF
    ELSE IF event_size == 'large' THEN  // 200+
        IF years >= 5 AND past_events >= 50 THEN RETURN 1.0
        ELSE IF years >= 3 THEN RETURN 0.6
        ELSE RETURN 0.3
        END IF
    END IF
END FUNCTION

FUNCTION scoreBudgetFit(talent_rate, event_budget):
    IF event_budget == 0 THEN RETURN 0.5
    
    IF talent_rate <= event_budget THEN
        RETURN 1.0
    ELSE
        overage = (talent_rate - event_budget) / event_budget
        IF overage < 0.3 THEN RETURN 0.7
        ELSE RETURN 0.3
        END IF
    END IF
END FUNCTION
```

### Complexity Analysis

- **Time Complexity**: O(n × (s × r)) where n = talent pool, s = specialties, r = required skills
- **Space Complexity**: O(n)
- **Real-world**: ~200 talent profiles, <50ms response time

---

## 4. Teacher-Student Pairing

### Purpose
Match students with ideal tango teachers based on level, goals, location, and teaching style.

(Documented in server/algorithms/teacherMatching.ts - see lines 1-312)

**Summary**: Multi-factor scoring across level match (25%), specialty alignment (20%), availability (15%), location (15%), quality/reputation (10%), teaching style (10%), budget (5%).

**Key Feature**: Adjacent level matching (teacher can teach ±1 level from student)

---

## 5. Roommate Matching

### Purpose
Pair travelers or locals seeking shared accommodation based on lifestyle compatibility.

### Algorithm

```pseudocode
FUNCTION matchRoommates(user, candidates):
    matches = []
    
    FOR EACH candidate IN candidates DO
        score = 0
        
        // Factor 1: Lifestyle Compatibility (30%)
        lifestyle_score = scoreLifestyle(user, candidate)
        score += lifestyle_score × 0.30
        
        // Factor 2: Cleanliness Alignment (20%)
        clean_diff = abs(user.cleanlinessLevel - candidate.cleanlinessLevel)
        cleanliness_score = 1 - (clean_diff / 5)
        score += cleanliness_score × 0.20
        
        // Factor 3: Schedule Compatibility (20%)
        schedule_score = scoreScheduleCompat(user, candidate)
        score += schedule_score × 0.20
        
        // Factor 4: Shared Interests (15%)
        interests_score = jaccardSimilarity(user.interests, candidate.interests)
        score += interests_score × 0.15
        
        // Factor 5: Age Proximity (10%)
        age_diff = abs(user.age - candidate.age)
        age_score = max(0, 1 - age_diff / 30)
        score += age_score × 0.10
        
        // Factor 6: Language Match (5%)
        language_score = hasCommonLanguage(user, candidate) ? 1.0 : 0.3
        score += language_score × 0.05
        
        matches.append({
            userId: candidate.id,
            score: score,
            compatibility: round(score × 100),
            lifestyle: getLifestyleLabel(candidate),
            strengths: identifyStrengths(user, candidate, score),
            considerations: identifyConsiderations(user, candidate, score)
        })
    END FOR
    
    SORT matches BY score DESC
    RETURN matches[0:10]
END FUNCTION

FUNCTION scoreLifestyle(user, candidate):
    compatibility = 0
    
    // Sleep schedule (early bird vs night owl)
    sleep_diff = abs(user.bedtime - candidate.bedtime)
    compatibility += max(0, 1 - sleep_diff / 6) × 0.4
    
    // Social activity level
    social_diff = abs(user.socialLevel - candidate.socialLevel)
    compatibility += (1 - social_diff / 5) × 0.3
    
    // Noise tolerance
    IF abs(user.noiseTolerance - candidate.noiseTolerance) <= 1 THEN
        compatibility += 0.3
    END IF
    
    RETURN compatibility
END FUNCTION

FUNCTION scoreScheduleCompat(user, candidate):
    // Check overlap in home hours
    user_home_hours = user.typicalHomeHours  // e.g., [18, 19, 20, 21, 22]
    candidate_home_hours = candidate.typicalHomeHours
    
    overlap = length(intersect(user_home_hours, candidate_home_hours))
    total = length(union(user_home_hours, candidate_home_hours))
    
    IF total == 0 THEN RETURN 0.5
    
    // Some overlap good, too much may cause friction
    overlap_ratio = overlap / total
    
    IF overlap_ratio > 0.7 THEN
        RETURN 0.6  // Too much overlap
    ELSE IF overlap_ratio > 0.3 THEN
        RETURN 1.0  // Good balance
    ELSE
        RETURN 0.8  // Minimal overlap (independent schedules)
    END IF
END FUNCTION

FUNCTION jaccardSimilarity(set1, set2):
    intersection = intersect(set1, set2)
    union = union(set1, set2)
    
    IF length(union) == 0 THEN RETURN 0
    RETURN length(intersection) / length(union)
END FUNCTION
```

### Complexity Analysis

- **Time Complexity**: O(n × (h + i)) where n = candidates, h = home hours, i = interests
- **Space Complexity**: O(n)

### Edge Cases

1. **Extreme Night Owl + Early Bird**: Low lifestyle score but may work if schedules don't overlap
2. **Different Cleanliness Standards**: Major compatibility factor, flagged prominently
3. **Age Gap >30 Years**: Still possible but noted
4. **No Shared Interests**: Neutral, not disqualifying

---

## 6. Mentor Matching

### Purpose
Connect experienced dancers with those seeking guidance and development.

### Algorithm

```pseudocode
FUNCTION matchMentors(mentee, available_mentors):
    matches = []
    
    FOR EACH mentor IN available_mentors DO
        score = 0
        
        // Factor 1: Expertise in Mentee's Goals (40%)
        expertise_score = scoreExpertise(mentor.expertise, mentee.goals)
        score += expertise_score × 0.40
        
        // Factor 2: Experience Gap (25%)
        gap_score = scoreExperienceGap(mentee.yearsExperience, mentor.yearsExperience)
        score += gap_score × 0.25
        
        // Factor 3: Availability Match (20%)
        availability_score = scoreAvailability(mentee.preferredTimes, mentor.availableSlots)
        score += availability_score × 0.20
        
        // Factor 4: Mentoring Style Fit (10%)
        style_score = scoreMentoringStyle(mentee.preferredStyle, mentor.mentoringStyle)
        score += style_score × 0.10
        
        // Factor 5: Past Success Rate (5%)
        success_score = mentor.successfulMentorships / max(mentor.totalMentorships, 1)
        score += success_score × 0.05
        
        matches.append({
            mentorId: mentor.id,
            score: score,
            expertise: mentor.expertise,
            availability: availability_score > 0.5,
            matchReasons: generateMentorReasons(mentor, mentee)
        })
    END FOR
    
    SORT matches BY score DESC
    RETURN matches[0:5]
END FUNCTION

FUNCTION scoreExpertise(mentor_expertise, mentee_goals):
    IF isEmpty(mentee_goals) THEN RETURN 0.5
    
    matched = 0
    FOR EACH goal IN mentee_goals DO
        FOR EACH area IN mentor_expertise DO
            IF contains(toLowerCase(area), toLowerCase(goal)) THEN
                matched += 1
                BREAK
            END IF
        END FOR
    END FOR
    
    RETURN matched / length(mentee_goals)
END FUNCTION

FUNCTION scoreExperienceGap(mentee_years, mentor_years):
    gap = mentor_years - mentee_years
    
    // Ideal gap: 5-10 years
    IF gap >= 5 AND gap <= 10 THEN
        RETURN 1.0
    ELSE IF gap >= 3 AND gap < 5 THEN
        RETURN 0.8
    ELSE IF gap > 10 AND gap <= 15 THEN
        RETURN 0.7
    ELSE IF gap > 15 THEN
        RETURN 0.5  // Very experienced (may be too advanced)
    ELSE
        RETURN 0.3  // Insufficient gap
    END IF
END FUNCTION
```

---

## 7. Workshop Recommendation

### Purpose
Suggest relevant workshops based on skill level, interests, and learning goals.

### Algorithm

```pseudocode
FUNCTION recommendWorkshops(user, available_workshops):
    recommendations = []
    
    FOR EACH workshop IN available_workshops DO
        score = 0
        
        // Factor 1: Level Appropriateness (35%)
        level_score = scoreLevelFit(user.skillLevel, workshop.targetLevel)
        score += level_score × 0.35
        
        // Factor 2: Topic Interest (30%)
        topic_score = scoreTopicInterest(user.interests, workshop.topics)
        score += topic_score × 0.30
        
        // Factor 3: Instructor Reputation (20%)
        instructor_score = workshop.instructor.rating / 5
        score += instructor_score × 0.20
        
        // Factor 4: Schedule Fit (10%)
        schedule_score = isAvailable(user, workshop.schedule) ? 1.0 : 0.0
        score += schedule_score × 0.10
        
        // Factor 5: Social Proof (5%)
        friends_registered = countFriendsRegistered(user, workshop)
        social_score = min(friends_registered / 3, 1.0)
        score += social_score × 0.05
        
        recommendations.append({
            workshopId: workshop.id,
            score: score,
            title: workshop.title,
            instructor: workshop.instructor.name,
            reasons: generateWorkshopReasons(workshop, user, level_score, topic_score)
        })
    END FOR
    
    SORT recommendations BY score DESC
    RETURN recommendations[0:12]
END FUNCTION

FUNCTION scoreLevelFit(user_level, target_level):
    levels = ['beginner', 'intermediate', 'advanced', 'professional']
    user_idx = indexOf(levels, user_level)
    target_idx = indexOf(levels, target_level)
    
    diff = abs(user_idx - target_idx)
    
    IF diff == 0 THEN RETURN 1.0        // Perfect fit
    ELSE IF diff == 1 THEN RETURN 0.7   // Slightly challenging/easy
    ELSE IF diff == 2 THEN RETURN 0.3   // May be too hard/easy
    ELSE RETURN 0.1                      // Inappropriate level
    END IF
END FUNCTION
```

---

## 8. Venue Recommendation

### Purpose
Suggest ideal practice venues or milongas based on user preferences and location.

(Similar to Event Recommendation but venue-focused)

---

## 9. Carpool Matching

### Purpose
Connect travelers with similar routes for ride-sharing to events.

### Algorithm

```pseudocode
FUNCTION matchCarpools(trip, available_drivers):
    matches = []
    
    FOR EACH driver IN available_drivers DO
        // Calculate route compatibility
        route_score = scoreRouteCompatibility(trip, driver.route)
        
        IF route_score < 0.3 THEN
            CONTINUE  // Routes too different
        END IF
        
        score = 0
        
        // Factor 1: Route Overlap (50%)
        score += route_score × 0.50
        
        // Factor 2: Time Compatibility (30%)
        time_diff = abs(hoursBetween(trip.departureTime, driver.departureTime))
        time_score = max(0, 1 - time_diff / 2)  // Within 2 hours = good
        score += time_score × 0.30
        
        // Factor 3: Available Seats (10%)
        seat_score = driver.availableSeats >= trip.requiredSeats ? 1.0 : 0.0
        score += seat_score × 0.10
        
        // Factor 4: User Rating (10%)
        rating_score = driver.rating / 5
        score += rating_score × 0.10
        
        matches.append({
            driverId: driver.id,
            score: score,
            detour: calculateDetour(trip, driver.route),
            estimatedCost: estimateCost(distance, driver.pricePerKm)
        })
    END FOR
    
    SORT matches BY score DESC
    RETURN matches[0:8]
END FUNCTION

FUNCTION scoreRouteCompatibility(trip, driver_route):
    // Check if trip start/end are near driver's route
    start_distance = distanceToRoute(trip.start, driver_route)
    end_distance = distanceToRoute(trip.end, driver_route)
    
    // Both must be within reasonable detour
    IF start_distance > 10_KM OR end_distance > 10_KM THEN
        RETURN 0
    END IF
    
    // Score based on minimal detour
    total_detour = start_distance + end_distance
    score = max(0, 1 - total_detour / 15)
    
    RETURN score
END FUNCTION
```

---

## 10. Language Partner

### Purpose
Match users learning Spanish with native speakers for language exchange.

### Algorithm

```pseudocode
FUNCTION matchLanguagePartners(user, candidates):
    matches = []
    
    FOR EACH candidate IN candidates DO
        score = 0
        
        // Factor 1: Complementary Languages (40%)
        language_score = scoreLanguageComplement(user, candidate)
        score += language_score × 0.40
        
        // Factor 2: Level Compatibility (25%)
        level_score = scoreLevelCompat(user, candidate)
        score += level_score × 0.25
        
        // Factor 3: Shared Interests (20%)
        interests_score = jaccardSimilarity(user.interests, candidate.interests)
        score += interests_score × 0.20
        
        // Factor 4: Availability Overlap (10%)
        availability_score = scoreAvailability(user.freeHours, candidate.freeHours)
        score += availability_score × 0.10
        
        // Factor 5: Location Proximity (5%)
        IF user.city == candidate.city THEN
            location_score = 1.0
        ELSE
            location_score = 0.3  // Can still practice online
        END IF
        score += location_score × 0.05
        
        matches.append({
            partnerId: candidate.id,
            score: score,
            nativeLanguage: candidate.nativeLanguage,
            learningLanguage: candidate.learningLanguage,
            level: candidate.languageLevel
        })
    END FOR
    
    SORT matches BY score DESC
    RETURN matches[0:10]
END FUNCTION

FUNCTION scoreLanguageComplement(user, candidate):
    // Perfect: User's learning = Candidate's native AND vice versa
    perfect_match = 
        (user.learningLanguage == candidate.nativeLanguage) AND
        (user.nativeLanguage == candidate.learningLanguage)
    
    IF perfect_match THEN
        RETURN 1.0
    END IF
    
    // Good: User's learning = Candidate's native
    IF user.learningLanguage == candidate.nativeLanguage THEN
        RETURN 0.7
    END IF
    
    // Acceptable: Both learning same language (can practice together)
    IF user.learningLanguage == candidate.learningLanguage THEN
        RETURN 0.4
    END IF
    
    RETURN 0.1
END FUNCTION

FUNCTION scoreLevelCompat(user, candidate):
    // Similar levels preferred for mutual benefit
    diff = abs(user.languageLevel - candidate.languageLevel)
    
    IF diff == 0 THEN RETURN 1.0
    ELSE IF diff == 1 THEN RETURN 0.8
    ELSE IF diff == 2 THEN RETURN 0.5
    ELSE RETURN 0.3
    END IF
END FUNCTION
```

---

## 11. Practice Partner

### Purpose
Find partners for regular practice sessions outside of classes.

(Similar to Dance Partner Matching but optimized for consistent practice schedules)

---

## 12. Event Buddy

### Purpose
Match solo attendees with companions for events.

### Algorithm

```pseudocode
FUNCTION matchEventBuddies(user, event, other_attendees):
    matches = []
    
    FOR EACH attendee IN other_attendees DO
        IF attendee.id == user.id THEN CONTINUE
        
        score = 0
        
        // Factor 1: Similar Experience Level (30%)
        level_diff = abs(user.tangoBuddy.experienceLevel - attendee.experienceLevel)
        level_score = max(0, 1 - level_diff / 5)
        score += level_score × 0.30
        
        // Factor 2: Shared Interests (25%)
        interests_score = jaccardSimilarity(user.interests, attendee.interests)
        score += interests_score × 0.25
        
        // Factor 3: Mutual Friends (20%)
        mutual = countMutualFriends(user, attendee)
        mutual_score = min(mutual / 5, 1.0)
        score += mutual_score × 0.20
        
        // Factor 4: Similar Age (15%)
        age_diff = abs(user.age - attendee.age)
        age_score = max(0, 1 - age_diff / 20)
        score += age_score × 0.15
        
        // Factor 5: Previous Positive Interactions (10%)
        history_score = getPreviousInteractionScore(user, attendee)
        score += history_score × 0.10
        
        matches.append({
            userId: attendee.id,
            score: score,
            mutualFriends: mutual,
            reasons: generateBuddyReasons(user, attendee)
        })
    END FOR
    
    SORT matches BY score DESC
    RETURN matches[0:5]
END FUNCTION
```

---

## 13. Collaboration Match

### Purpose
Connect users for collaborative projects (performances, teaching, organizing).

### Algorithm

```pseudocode
FUNCTION matchCollaborators(project, potential_collaborators):
    matches = []
    
    FOR EACH collaborator IN potential_collaborators DO
        score = 0
        
        // Factor 1: Skill Complementarity (35%)
        skill_score = scoreSkillComplement(project.needed_skills, collaborator.skills)
        score += skill_score × 0.35
        
        // Factor 2: Availability (25%)
        availability_score = scoreAvailability(project.timeline, collaborator.availability)
        score += availability_score × 0.25
        
        // Factor 3: Past Collaboration Success (20%)
        IF hasCollaborated(project.owner, collaborator) THEN
            history_score = getCollaborationRating(project.owner, collaborator)
            score += history_score × 0.20
        ELSE
            score += 0.10  // Neutral for new collaborations
        END IF
        
        // Factor 4: Work Style Compatibility (15%)
        style_score = scoreWorkStyle(project.owner, collaborator)
        score += style_score × 0.15
        
        // Factor 5: Network Reach (5%)
        network_score = min(collaborator.followerCount / 1000, 1.0)
        score += network_score × 0.05
        
        matches.append({
            userId: collaborator.id,
            score: score,
            skills: collaborator.skills,
            portfolio: collaborator.portfolio
        })
    END FOR
    
    SORT matches BY score DESC
    RETURN matches[0:10]
END FUNCTION

FUNCTION scoreSkillComplement(needed, offered):
    IF isEmpty(needed) THEN RETURN 0.5
    
    covered = 0
    FOR EACH skill IN needed DO
        IF skill IN offered THEN
            covered += 1
        END IF
    END FOR
    
    RETURN covered / length(needed)
END FUNCTION
```

---

## 14. Network Expansion

### Purpose
Suggest strategic connections to grow user's professional network.

### Algorithm

```pseudocode
FUNCTION suggestNetworkExpansion(user, network_graph):
    suggestions = []
    
    // Get degree-2 connections (friends of friends)
    degree2 = getSecondDegreeConnections(user, network_graph)
    
    FOR EACH potential IN degree2 DO
        score = 0
        
        // Factor 1: Mutual Connections (30%)
        mutual_count = countMutualFriends(user, potential)
        mutual_score = min(mutual_count / 5, 1.0)
        score += mutual_score × 0.30
        
        // Factor 2: Network Value (25%)
        // Connecting to well-connected people adds value
        network_value = min(potential.connectionCount / 200, 1.0)
        score += network_value × 0.25
        
        // Factor 3: Complementary Expertise (20%)
        expertise_score = scoreComplementaryExpertise(user, potential)
        score += expertise_score × 0.20
        
        // Factor 4: Same City/Region (15%)
        location_score = user.city == potential.city ? 1.0 : 0.3
        score += location_score × 0.15
        
        // Factor 5: Activity Level (10%)
        activity_score = min(potential.recentActivityScore / 100, 1.0)
        score += activity_score × 0.10
        
        suggestions.append({
            userId: potential.id,
            score: score,
            mutualFriends: mutual_count,
            expertise: potential.primaryExpertise,
            value_proposition: generateValueProp(user, potential)
        })
    END FOR
    
    SORT suggestions BY score DESC
    RETURN suggestions[0:15]
END FUNCTION

FUNCTION scoreComplementaryExpertise(user, potential):
    user_areas = Set(user.expertise)
    potential_areas = Set(potential.expertise)
    
    // High score if they have expertise user lacks
    unique_to_potential = potential_areas.difference(user_areas)
    
    IF isEmpty(unique_to_potential) THEN
        RETURN 0.3  // Overlapping expertise (less valuable)
    ELSE
        RETURN min(length(unique_to_potential) / 3, 1.0)
    END IF
END FUNCTION
```

---

## 15. Cultural Fit Score

### Purpose
Assess compatibility for community membership or group participation.

### Algorithm

```pseudocode
FUNCTION calculateCulturalFit(user, community):
    fit_score = 0
    
    // Factor 1: Values Alignment (35%)
    values_score = scoreValuesAlignment(user.values, community.coreValues)
    fit_score += values_score × 0.35
    
    // Factor 2: Behavioral Norms (25%)
    behavior_score = scoreBehavioralFit(user.behaviorProfile, community.norms)
    fit_score += behavior_score × 0.25
    
    // Factor 3: Communication Style (20%)
    comm_score = scoreCommunicationFit(user.commStyle, community.preferredStyle)
    fit_score += comm_score × 0.20
    
    // Factor 4: Activity Participation (15%)
    activity_score = scoreActivityAlignment(user.interests, community.activities)
    fit_score += activity_score × 0.15
    
    // Factor 5: Experience Level (5%)
    experience_score = scoreExperienceFit(user.experienceLevel, community.typicalLevel)
    fit_score += experience_score × 0.05
    
    RETURN {
        score: fit_score,
        fitLevel: getFitLevel(fit_score),
        strengths: identifyFitStrengths(user, community, fit_score),
        potential_challenges: identifyFitChallenges(user, community, fit_score)
    }
END FUNCTION

FUNCTION scoreValuesAlignment(user_values, community_values):
    IF isEmpty(community_values) THEN RETURN 0.5
    
    aligned = 0
    FOR EACH value IN community_values DO
        IF value IN user_values THEN
            aligned += 1
        END IF
    END FOR
    
    RETURN aligned / length(community_values)
END FUNCTION

FUNCTION scoreBehavioralFit(user_behavior, community_norms):
    compatibility = 0.5  // Base
    
    // Social activity level
    IF abs(user_behavior.socialLevel - community_norms.avgSocialLevel) <= 1 THEN
        compatibility += 0.2
    END IF
    
    // Formality preference
    IF user_behavior.formalityPref == community_norms.typicalFormality THEN
        compatibility += 0.2
    END IF
    
    // Conflict resolution style
    IF user_behavior.conflictStyle IN community_norms.acceptedStyles THEN
        compatibility += 0.1
    END IF
    
    RETURN min(compatibility, 1.0)
END FUNCTION

FUNCTION getFitLevel(score):
    IF score >= 0.8 THEN RETURN 'excellent_fit'
    ELSE IF score >= 0.6 THEN RETURN 'good_fit'
    ELSE IF score >= 0.4 THEN RETURN 'moderate_fit'
    ELSE RETURN 'poor_fit'
    END IF
END FUNCTION
```

### Complexity Analysis

- **Time Complexity**: O(v + b + a) where v = values, b = behaviors, a = activities
- **Space Complexity**: O(1)
- **Use Cases**: Community onboarding, group formation, team building

### Edge Cases

1. **New User**: Minimal profile data → lower confidence score
2. **Evolving Community**: Norms may shift over time
3. **Multi-faceted Communities**: May fit some aspects but not others
4. **Cross-cultural**: Values may be interpreted differently

---

## Appendix

### Performance Benchmarks

| Algorithm | Avg Time | Candidate Pool |
|-----------|----------|----------------|
| Partner Matching | 85ms | 500 dancers |
| Housing Match | 120ms | 1000 listings |
| Talent Match | 60ms | 200 talents |
| Teacher-Student | 95ms | 150 teachers |
| Roommate Matching | 70ms | 300 candidates |

### Common Patterns

1. **Multi-factor Weighted Scoring**: All algorithms use weighted combination
2. **Jaccard Similarity**: For set-based comparisons (interests, skills)
3. **Distance Decay**: Exponential for location, linear for time
4. **Threshold Filtering**: Pre-filter hard constraints before scoring
5. **Top-K Selection**: Return limited results sorted by score

### Future Enhancements

1. **Machine Learning**: Replace heuristic weights with learned models
2. **Collaborative Filtering**: "Users like you also matched with..."
3. **Feedback Loops**: Adjust weights based on successful matches
4. **Multi-objective Optimization**: Pareto-optimal matching
5. **Graph Neural Networks**: For network-based matching

---

**Document End**
