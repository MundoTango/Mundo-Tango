/**
 * Social Media Test Fixtures
 * Sample data for social media integration testing
 */

export const testPosts = [
  {
    content: 'Just had an amazing tango night at the milonga! 💃🕺 #Tango #BuenosAires #Milonga',
    platforms: ['instagram', 'facebook', 'twitter'],
    hasImage: true,
  },
  {
    content: 'Learning the sacada today - such an elegant movement! Check out my progress.',
    platforms: ['instagram', 'linkedin'],
    hasImage: true,
  },
  {
    content: 'Excited to announce our upcoming tango workshop this weekend! DM for details.',
    platforms: ['facebook', 'twitter', 'linkedin'],
    hasImage: false,
  },
];

export const aiGeneratedCaptions = [
  {
    original: 'Dancing at the festival',
    generated: '✨ Magical moments on the dance floor! Lost in the embrace of tango at this incredible festival. The music, the connection, the passion - this is what it\'s all about! 💫 #TangoLife #DancePassion #Festival2024',
    hashtags: ['#TangoLife', '#DancePassion', '#Festival2024', '#MilongaMagic', '#Embrace'],
  },
  {
    original: 'New shoes arrived',
    generated: '🎉 Finally! My dream tango shoes are here! Can\'t wait to break these beauties in on the dance floor tonight. The craftsmanship is incredible! 👠✨ #TangoShoes #NewGear #DancerLife',
    hashtags: ['#TangoShoes', '#NewGear', '#DancerLife', '#TangoStyle', '#DancerEssentials'],
  },
];

export const platforms = [
  {
    id: 'facebook',
    name: 'Facebook',
    connected: false,
    maxCharacters: 63206,
  },
  {
    id: 'instagram',
    name: 'Instagram',
    connected: false,
    maxCharacters: 2200,
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    connected: false,
    maxCharacters: 3000,
  },
  {
    id: 'twitter',
    name: 'X (Twitter)',
    connected: false,
    maxCharacters: 280,
  },
];

export const testCampaigns = [
  {
    name: 'Summer Tango Festival 2024',
    platforms: ['instagram', 'facebook', 'twitter'],
    startDate: '2024-06-01',
    endDate: '2024-08-31',
    goals: {
      reach: 50000,
      engagement: 5000,
      conversions: 500,
    },
  },
  {
    name: 'Winter Workshop Series',
    platforms: ['linkedin', 'facebook'],
    startDate: '2024-12-01',
    endDate: '2025-02-28',
    goals: {
      reach: 25000,
      engagement: 2500,
      conversions: 200,
    },
  },
];

export const engagementMetrics = {
  likes: 1250,
  comments: 87,
  shares: 43,
  reach: 15420,
  impressions: 28340,
  clicks: 542,
  saves: 124,
  engagementRate: 8.2,
};

export const audienceInsights = {
  demographics: {
    age: {
      '18-24': 12,
      '25-34': 35,
      '35-44': 28,
      '45-54': 18,
      '55+': 7,
    },
    gender: {
      female: 62,
      male: 36,
      other: 2,
    },
  },
  location: {
    'Buenos Aires': 28,
    'New York': 15,
    'Berlin': 12,
    'Paris': 10,
    'Other': 35,
  },
  interests: [
    'Dance',
    'Music',
    'Travel',
    'Culture',
    'Arts',
  ],
};

export const bestPostingTimes = {
  instagram: [
    { day: 'Monday', time: '18:00', confidence: 0.89 },
    { day: 'Wednesday', time: '19:30', confidence: 0.85 },
    { day: 'Saturday', time: '14:00', confidence: 0.92 },
  ],
  facebook: [
    { day: 'Tuesday', time: '12:00', confidence: 0.87 },
    { day: 'Thursday', time: '17:00', confidence: 0.88 },
    { day: 'Sunday', time: '10:00', confidence: 0.84 },
  ],
  twitter: [
    { day: 'Monday', time: '08:00', confidence: 0.82 },
    { day: 'Wednesday', time: '13:00', confidence: 0.86 },
    { day: 'Friday', time: '16:00', confidence: 0.85 },
  ],
  linkedin: [
    { day: 'Tuesday', time: '09:00', confidence: 0.91 },
    { day: 'Thursday', time: '11:00', confidence: 0.89 },
    { day: 'Friday', time: '15:00', confidence: 0.87 },
  ],
};
