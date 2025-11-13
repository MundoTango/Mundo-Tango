/**
 * Marketplace Test Fixtures
 * Sample data for marketplace and e-commerce testing
 */

export const testProducts = [
  {
    id: 'prod-1',
    title: 'Professional Tango Shoes - Women\'s',
    description: 'Handcrafted leather tango shoes with suede sole, perfect for milongas',
    price: 149.99,
    category: 'shoes',
    seller: 'TangoGear Pro',
    rating: 4.8,
    reviews: 127,
    inStock: true,
    images: ['/images/shoes-1.jpg'],
  },
  {
    id: 'prod-2',
    title: 'Elegant Tango Dress',
    description: 'Flowing dress with slit, perfect for social dancing',
    price: 89.99,
    category: 'clothing',
    seller: 'BuenosAires Fashion',
    rating: 4.6,
    reviews: 84,
    inStock: true,
    images: ['/images/dress-1.jpg'],
  },
  {
    id: 'prod-3',
    title: 'Golden Age Tango Music Collection',
    description: '100 classic tango recordings from the 1940s-1950s',
    price: 29.99,
    category: 'music',
    seller: 'Tango Archives',
    rating: 4.9,
    reviews: 256,
    inStock: true,
    images: ['/images/music-1.jpg'],
  },
  {
    id: 'prod-4',
    title: 'Tango Practice Heels - Size 8',
    description: 'Pre-owned, excellent condition. Used for 3 months.',
    price: 79.99,
    originalPrice: 129.99,
    category: 'shoes',
    seller: 'DancerResale',
    rating: 4.5,
    reviews: 23,
    condition: 'Used - Excellent',
    inStock: true,
    images: ['/images/heels-1.jpg'],
  },
];

export const testCart = {
  items: [
    {
      productId: 'prod-1',
      quantity: 1,
      price: 149.99,
    },
    {
      productId: 'prod-3',
      quantity: 2,
      price: 29.99,
    },
  ],
  subtotal: 209.97,
  tax: 18.90,
  shipping: 10.00,
  total: 238.87,
};

export const testOrders = [
  {
    id: 'order-1',
    date: '2024-01-15',
    status: 'delivered',
    items: 2,
    total: 238.87,
    trackingNumber: 'TRK123456789',
  },
  {
    id: 'order-2',
    date: '2024-01-20',
    status: 'shipped',
    items: 1,
    total: 149.99,
    trackingNumber: 'TRK987654321',
    estimatedDelivery: '2024-01-25',
  },
  {
    id: 'order-3',
    date: '2024-01-22',
    status: 'processing',
    items: 3,
    total: 349.97,
  },
];

export const sellerAnalytics = {
  totalSales: 15420.50,
  totalOrders: 247,
  averageOrderValue: 62.43,
  topSellingProducts: [
    {
      id: 'prod-1',
      name: 'Professional Tango Shoes',
      sales: 89,
      revenue: 13349.11,
    },
    {
      id: 'prod-3',
      name: 'Music Collection',
      sales: 156,
      revenue: 4678.44,
    },
  ],
  monthlyRevenue: [
    { month: 'Jan', revenue: 5240.20 },
    { month: 'Feb', revenue: 6180.30 },
    { month: 'Mar', revenue: 4000.00 },
  ],
  customerSatisfaction: 4.7,
};

export const productReviews = [
  {
    id: 'review-1',
    productId: 'prod-1',
    rating: 5,
    title: 'Amazing quality!',
    comment: 'These shoes are incredibly comfortable and perfect for dancing. Highly recommend!',
    author: 'Maria Garcia',
    date: '2024-01-10',
    helpful: 24,
    verified: true,
  },
  {
    id: 'review-2',
    productId: 'prod-1',
    rating: 4,
    title: 'Good shoes but sizing runs small',
    comment: 'Great quality but I had to exchange for a larger size. Order one size up!',
    author: 'John Smith',
    date: '2024-01-12',
    helpful: 18,
    verified: true,
  },
  {
    id: 'review-3',
    productId: 'prod-3',
    rating: 5,
    title: 'Essential collection for any tango DJ',
    comment: 'Perfect selection of classic tangos. The audio quality is excellent.',
    author: 'Carlos Rodriguez',
    date: '2024-01-08',
    helpful: 31,
    verified: true,
  },
];

export const shippingAddress = {
  name: 'Test User',
  line1: '123 Tango Street',
  line2: 'Apt 4B',
  city: 'Buenos Aires',
  state: 'BA',
  postal_code: '1000',
  country: 'AR',
  phone: '+54 11 1234 5678',
};

export const aiRecommendations = [
  {
    productId: 'prod-5',
    title: 'Similar style shoes in your size',
    reason: 'Based on your recent purchase',
    confidence: 0.89,
  },
  {
    productId: 'prod-6',
    title: 'Matching dress for your new shoes',
    reason: 'Frequently bought together',
    confidence: 0.82,
  },
  {
    productId: 'prod-7',
    title: 'Advanced tango music collection',
    reason: 'Next level from your current collection',
    confidence: 0.76,
  },
];

export const fraudDetection = {
  riskScore: 15, // Low risk (0-100 scale)
  factors: [
    { name: 'IP Address', status: 'safe', score: 5 },
    { name: 'Billing Address', status: 'verified', score: 0 },
    { name: 'Card Velocity', status: 'normal', score: 3 },
    { name: 'Device Fingerprint', status: 'recognized', score: 2 },
    { name: 'Email Reputation', status: 'good', score: 5 },
  ],
  recommendation: 'approve',
};

export const inventoryAlerts = [
  {
    productId: 'prod-1',
    name: 'Professional Tango Shoes',
    currentStock: 5,
    threshold: 10,
    alertLevel: 'low',
    reorderSuggestion: 20,
  },
  {
    productId: 'prod-8',
    name: 'Beginner Practice Shoes',
    currentStock: 2,
    threshold: 10,
    alertLevel: 'critical',
    reorderSuggestion: 30,
  },
];
