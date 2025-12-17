import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Award, Star, Shield, TrendingUp, Users } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface TangoResumeProps {
  resume: {
    roles: {
      teacher: RoleData;
      dj: RoleData;
      organizer: RoleData;
      performer: RoleData;
    };
    overallScore: number;
    totalEndorsements: number;
    uniqueEndorsers: number;
    verifiedEndorsements: number;
    averageRating: number;
    yearsExperience: number;
    highlightedSkills: Array<{
      role: string;
      skill: string;
      count: number;
    }>;
  };
}

interface RoleData {
  endorsements: number;
  score: number;
  topSkills: Array<{
    skill: string;
    count: number;
  }>;
  verifiedBy: Array<{
    id: number;
    name: string;
    profileImage: string | null;
  }>;
  averageRating: number;
}

export function TangoResume({ resume }: TangoResumeProps) {
  const {
    roles,
    overallScore,
    totalEndorsements,
    uniqueEndorsers,
    verifiedEndorsements,
    averageRating,
    yearsExperience,
    highlightedSkills,
  } = resume;

  const roleLabels: Record<string, string> = {
    teacher: "Teacher",
    dj: "DJ",
    organizer: "Organizer",
    performer: "Performer",
  };

  const roleIcons: Record<string, string> = {
    teacher: "👨‍🏫",
    dj: "🎵",
    organizer: "📋",
    performer: "💃",
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 50) return "text-yellow-600 dark:text-yellow-400";
    return "text-gray-600 dark:text-gray-400";
  };

  return (
    <div className="space-y-6">
      {/* Overall Score Card */}
      <Card data-testid="overall-score-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Professional Reputation Score
              </CardTitle>
              <CardDescription>Your overall tango reputation across all roles</CardDescription>
            </div>
            <div className={`text-5xl font-bold ${getScoreColor(overallScore)}`} data-testid="overall-score">
              {overallScore}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={overallScore} className="h-3" data-testid="overall-score-progress" />

          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="text-center" data-testid="stat-total-endorsements">
              <div className="text-2xl font-bold">{totalEndorsements}</div>
              <div className="text-sm text-muted-foreground">Total Endorsements</div>
            </div>
            <div className="text-center" data-testid="stat-unique-endorsers">
              <div className="text-2xl font-bold">{uniqueEndorsers}</div>
              <div className="text-sm text-muted-foreground">Unique Endorsers</div>
            </div>
            <div className="text-center" data-testid="stat-verified">
              <div className="text-2xl font-bold">{verifiedEndorsements}</div>
              <div className="text-sm text-muted-foreground">Verified</div>
            </div>
            <div className="text-center" data-testid="stat-avg-rating">
              <div className="text-2xl font-bold">{averageRating.toFixed(1)}</div>
              <div className="text-sm text-muted-foreground">Avg Rating</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Years Experience Badge */}
      {yearsExperience > 0 && (
        <Badge variant="outline" className="text-base" data-testid="years-experience">
          <TrendingUp className="mr-2 h-4 w-4" />
          {yearsExperience} {yearsExperience === 1 ? "Year" : "Years"} Dancing
        </Badge>
      )}

      {/* Role Breakdown */}
      <div className="grid gap-4 md:grid-cols-2">
        {Object.entries(roles).map(([role, data]) => (
          <Card key={role} data-testid={`role-card-${role}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">{roleIcons[role]}</span>
                {roleLabels[role]}
              </CardTitle>
              <CardDescription>{data.endorsements} endorsements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium">Role Score</span>
                  <span className={`text-xl font-bold ${getScoreColor(data.score)}`} data-testid={`${role}-score`}>
                    {data.score}/100
                  </span>
                </div>
                <Progress value={data.score} className="h-2" />
              </div>

              {data.averageRating > 0 && (
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium" data-testid={`${role}-rating`}>{data.averageRating.toFixed(1)}/5</span>
                </div>
              )}

              {data.topSkills.length > 0 && (
                <div>
                  <h4 className="mb-2 text-sm font-medium">Top Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {data.topSkills.map((skill) => (
                      <Badge key={skill.skill} variant="secondary" data-testid={`skill-${skill.skill}`}>
                        {skill.skill.replace(/_/g, " ")} ({skill.count})
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {data.verifiedBy.length > 0 && (
                <div>
                  <h4 className="mb-2 flex items-center gap-1 text-sm font-medium">
                    <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    Verified By
                  </h4>
                  <div className="flex -space-x-2">
                    {data.verifiedBy.slice(0, 5).map((user) => (
                      <Avatar key={user.id} className="h-8 w-8 border-2 border-background" data-testid={`verifier-${user.id}`}>
                        <AvatarImage src={user.profileImage || undefined} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    ))}
                    {data.verifiedBy.length > 5 && (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-muted text-xs">
                        +{data.verifiedBy.length - 5}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Highlighted Skills */}
      {highlightedSkills.length > 0 && (
        <Card data-testid="highlighted-skills-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Most Endorsed Skills
            </CardTitle>
            <CardDescription>Skills you're most recognized for across all roles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {highlightedSkills.map((item) => (
                <Badge
                  key={`${item.role}-${item.skill}`}
                  variant="outline"
                  className="text-base"
                  data-testid={`highlighted-skill-${item.skill}`}
                >
                  {roleIcons[item.role]} {item.skill.replace(/_/g, " ")} ({item.count})
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
