import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, MapPin, Calendar, Users, Home, Sparkles, Mail, MessageCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function AlertsPage() {
  const { t } = useTranslation();
  const [preferences, setPreferences] = useState({
    'new-events': true,
    'friend-activity': true,
    'housing-matches': true,
    'talent-match': true,
    'city-updates': true,
    'messages': true,
    'weekly-digest': false,
  });

  const alertTypes = [
    {
      id: 'new-events',
      icon: Calendar,
      title: t('pro:alerts.newEvents.title', 'New Events in Your Cities'),
      description: t('pro:alerts.newEvents.description', 'Get notified when new events are posted in cities you follow'),
      category: 'Events',
    },
    {
      id: 'friend-activity',
      icon: Users,
      title: t('pro:alerts.friendActivity.title', 'Friend Activity'),
      description: t('pro:alerts.friendActivity.description', 'See when friends RSVP to events or share posts'),
      category: 'Social',
    },
    {
      id: 'housing-matches',
      icon: Home,
      title: t('pro:alerts.housingMatches.title', 'Housing Matches'),
      description: t('pro:alerts.housingMatches.description', 'New housing listings matching your travel plans'),
      category: 'Housing',
    },
    {
      id: 'talent-match',
      icon: Sparkles,
      title: t('pro:alerts.talentMatch.title', 'Talent Match Opportunities'),
      description: t('pro:alerts.talentMatch.description', 'New professional opportunities matching your profile'),
      category: 'Professional',
    },
    {
      id: 'city-updates',
      icon: MapPin,
      title: t('pro:alerts.cityUpdates.title', 'City Community Updates'),
      description: t('pro:alerts.cityUpdates.description', 'Important announcements from city organizers'),
      category: 'Cities',
    },
    {
      id: 'messages',
      icon: MessageCircle,
      title: t('pro:alerts.messages.title', 'Direct Messages'),
      description: t('pro:alerts.messages.description', 'New messages from other users'),
      category: 'Messages',
    },
    {
      id: 'weekly-digest',
      icon: Mail,
      title: t('pro:alerts.weeklyDigest.title', 'Weekly Digest'),
      description: t('pro:alerts.weeklyDigest.description', 'Summary of activity and recommendations sent weekly'),
      category: 'Digest',
    },
  ];

  const handleToggle = (id: string) => {
    setPreferences(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const groupedAlerts = alertTypes.reduce((acc, alert) => {
    if (!acc[alert.category]) {
      acc[alert.category] = [];
    }
    acc[alert.category].push(alert);
    return acc;
  }, {} as Record<string, typeof alertTypes>);

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="flex items-center gap-3 mb-8">
        <Bell className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">{t('pro:alerts.title', 'Alert Preferences')}</h1>
          <p className="text-muted-foreground">
            {t('pro:alerts.subtitle', 'Customize notifications for your tango journey')}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {Object.entries(groupedAlerts).map(([category, alerts]) => (
          <div key={category}>
            <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
              {category}
              <Badge variant="secondary" className="text-xs">
                {alerts.length} {t('pro:alerts.alerts', 'alerts')}
              </Badge>
            </h2>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <Card key={alert.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <alert.icon className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-1">{alert.title}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {alert.description}
                          </p>
                        </div>
                      </div>
                      <Switch
                        id={`alert-${alert.id}`}
                        checked={preferences[alert.id]}
                        onCheckedChange={() => handleToggle(alert.id)}
                      />
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {t('pro:alerts.emailNote', 'Email notifications are sent to your registered email address')}
        </p>
        <div className="flex gap-3">
          <Button variant="outline">
            {t('common:cancel', 'Cancel')}
          </Button>
          <Button>
            {t('common:save', 'Save Preferences')}
          </Button>
        </div>
      </div>
    </div>
  );
}
