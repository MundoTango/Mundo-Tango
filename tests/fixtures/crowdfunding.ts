/**
 * Crowdfunding System Test Fixtures
 * Provides test data for campaigns, donations, donors, updates
 */

export const testCampaign = {
  title: 'Help Me Attend Tango Festival in Buenos Aires',
  description: 'I\'m passionate about tango and have been dancing for 5 years. This festival is a once-in-a-lifetime opportunity to learn from world-renowned maestros and immerse myself in Argentine tango culture. Your support will help cover travel costs, workshop fees, and accommodations.',
  goalAmount: 2500,
  duration: 60,
  category: 'travel',
  rewardTiers: [
    {
      name: 'Thank You',
      amount: 10,
      description: 'A heartfelt thank you message and photo from Buenos Aires',
      quantity: 100
    },
    {
      name: 'Video Update',
      amount: 25,
      description: 'Exclusive video updates from the festival',
      quantity: 50
    },
    {
      name: 'Dance Lesson',
      amount: 50,
      description: 'Private 30-minute tango lesson when I return',
      quantity: 20
    },
    {
      name: 'Workshop Recording',
      amount: 100,
      description: 'Recording of one of the workshops I attend',
      quantity: 10
    }
  ]
};

export const suspiciousCampaign = {
  title: 'GUARANTEED RETURNS - LIMITED TIME OFFER!!!',
  description: 'This AMAZING opportunity will change your life FOREVER! I promise GUARANTEED returns and INCREDIBLE success! Send money NOW before this LIMITED TIME offer expires! Act FAST!!!',
  goalAmount: 1000000,
  duration: 365,
  category: 'business'
};

export const testDonation = {
  amount: 50,
  recurring: false,
  cardNumber: '4242424242424242',
  cardExpiry: '12/30',
  cardCvc: '123'
};

export const recurringDonation = {
  amount: 25,
  recurring: true,
  interval: 'monthly' as const,
  cardNumber: '4242424242424242'
};

export const testCampaignUpdate = {
  title: 'Halfway to Our Goal!',
  content: 'Thank you so much for your support! We\'ve reached 50% of our funding goal in just 2 weeks. Here are some photos from my recent tango practice sessions as I prepare for the festival.',
  mediaType: 'image',
  mediaUrl: 'https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=800'
};

export const sampleCampaigns = [
  {
    id: 1,
    userId: 1,
    title: 'Buenos Aires Tango Adventure',
    description: 'Help me attend the World Tango Championship',
    goalAmount: 3000,
    currentAmount: 1500,
    donorCount: 25,
    status: 'active',
    daysRemaining: 30,
    category: 'travel',
    image: 'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=800'
  },
  {
    id: 2,
    userId: 1,
    title: 'Tango Shoe Collection Launch',
    description: 'Launch my handcrafted tango shoe brand',
    goalAmount: 5000,
    currentAmount: 4200,
    donorCount: 45,
    status: 'active',
    daysRemaining: 15,
    category: 'business',
    image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800'
  },
  {
    id: 3,
    userId: 1,
    title: 'Community Tango Studio',
    description: 'Build a free tango studio for the community',
    goalAmount: 10000,
    currentAmount: 10500,
    donorCount: 120,
    status: 'successful',
    daysRemaining: 0,
    category: 'community',
    image: 'https://images.unsplash.com/photo-1545128485-c400e7702796?w=800'
  },
  {
    id: 4,
    userId: 1,
    title: 'Tango Documentary Film',
    description: 'Film a documentary about tango culture',
    goalAmount: 8000,
    currentAmount: 2100,
    donorCount: 18,
    status: 'active',
    daysRemaining: 45,
    category: 'creative',
    image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800'
  }
];

export const sampleDonors = [
  {
    id: 1,
    name: 'Emily Johnson',
    email: 'emily@example.com',
    amount: 100,
    donationType: 'one-time',
    avatar: 'https://i.pravatar.cc/150?img=1',
    message: 'So proud of you! Can\'t wait to see you dance in Buenos Aires!'
  },
  {
    id: 2,
    name: 'Michael Chen',
    email: 'michael@example.com',
    amount: 25,
    donationType: 'recurring',
    avatar: 'https://i.pravatar.cc/150?img=12',
    message: 'Supporting you every month. Keep dancing!'
  },
  {
    id: 3,
    name: 'Sarah Williams',
    email: 'sarah@example.com',
    amount: 500,
    donationType: 'one-time',
    avatar: 'https://i.pravatar.cc/150?img=5',
    message: 'Tango changed my life too. Hope this helps you reach your dream!'
  },
  {
    id: 4,
    name: 'David Martinez',
    email: 'david@example.com',
    amount: 50,
    donationType: 'one-time',
    avatar: 'https://i.pravatar.cc/150?img=8',
    message: 'Good luck at the festival!'
  }
];

export const sampleUpdates = [
  {
    id: 1,
    campaignId: 1,
    title: '25% Funded in First Week!',
    content: 'Wow! Thank you all so much. We\'ve raised $750 in just one week!',
    mediaUrl: 'https://images.unsplash.com/photo-1504805572947-34fad45aed93?w=800',
    likes: 12,
    comments: 5,
    createdAt: '2025-05-01T10:00:00Z'
  },
  {
    id: 2,
    campaignId: 1,
    title: 'Halfway There!',
    content: 'We\'ve reached 50% of our goal! Only $1,500 more to go!',
    mediaUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800',
    likes: 18,
    comments: 8,
    createdAt: '2025-05-15T14:30:00Z'
  }
];

export const donationTestScenarios = {
  successful: {
    cardNumber: '4242424242424242',
    expectedResult: 'success'
  },
  declined: {
    cardNumber: '4000000000000002',
    expectedResult: 'declined'
  },
  insufficientFunds: {
    cardNumber: '4000000000009995',
    expectedResult: 'insufficient_funds'
  },
  fraudCheck: {
    cardNumber: '4100000000000019',
    expectedResult: 'fraud_check_required'
  }
};

export const aiOptimizationSuggestions = {
  title: {
    current: 'Help Me Go To Tango Festival',
    suggested: 'Join Me in My Dream: Dancing at the World Tango Championship in Buenos Aires'
  },
  story: {
    qualityScore: 72,
    improvements: [
      'Add more emotional storytelling',
      'Include specific goals and outcomes',
      'Mention community impact',
      'Add personal connection to tango'
    ]
  },
  rewardTiers: {
    current: 2,
    suggested: 5,
    recommendedPricing: [10, 25, 50, 100, 250]
  },
  goalAmount: {
    current: 5000,
    optimal: 2500,
    reason: 'Lower goals have 65% higher success rate for this category'
  },
  duration: {
    current: 90,
    optimal: 60,
    reason: 'Campaigns between 30-60 days have 40% higher completion rate'
  }
};

export const successPredictionFactors = {
  titleQuality: 85,
  storyQuality: 78,
  goalRealism: 92,
  rewardTierOptimization: 70,
  categoryPopularity: 88,
  userReputation: 95,
  overallProbability: 84
};
