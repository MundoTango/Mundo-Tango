import { db } from "@shared/db";
import { marketplaceProducts, users } from "@shared/schema";
import { eq, and, desc, sql, or } from "drizzle-orm";
import { RateLimitedAIOrchestrator } from "../ai/integration/rate-limited-orchestrator";

interface QAResult {
  productId: number;
  approved: boolean;
  overallScore: number;
  checks: {
    contentPolicy: QACheck;
    imageQuality: QACheck;
    categoryAccuracy: QACheck;
    descriptionAccuracy: QACheck;
    duplicateDetection: QACheck;
    brandAuthenticity: QACheck;
  };
  violations: string[];
  warnings: string[];
  recommendations: string[];
  autoApproved: boolean;
  requiresManualReview: boolean;
}

interface QACheck {
  passed: boolean;
  score: number;
  issues: string[];
  details?: any;
}

interface ProhibitedItemCheck {
  isProhibited: boolean;
  category?: string;
  reasons: string[];
}

export class QualityAssuranceAgent {
  private static aiOrchestrator = new RateLimitedAIOrchestrator();
  
  private static readonly PROHIBITED_KEYWORDS = [
    'weapon', 'gun', 'explosive', 'drug', 'illegal', 'counterfeit',
    'pirated', 'stolen', 'hacked', 'crack', 'keygen'
  ];

  private static readonly MIN_AUTO_APPROVE_SCORE = 75;
  private static readonly MIN_IMAGE_COUNT = 1;
  private static readonly MIN_DESCRIPTION_LENGTH = 50;

  static async reviewListing(productId: number): Promise<QAResult> {
    const product = await db
      .select()
      .from(marketplaceProducts)
      .where(eq(marketplaceProducts.id, productId))
      .limit(1);

    if (!product.length) {
      throw new Error('Product not found');
    }

    const p = product[0];

    const contentPolicyCheck = await this.checkContentPolicy(p);
    const imageQualityCheck = this.checkImageQuality(p);
    const categoryAccuracyCheck = this.checkCategoryAccuracy(p);
    const descriptionCheck = await this.checkDescriptionAccuracy(p);
    const duplicateCheck = await this.detectDuplicates(p);
    const brandCheck = this.checkBrandAuthenticity(p);

    const checks = {
      contentPolicy: contentPolicyCheck,
      imageQuality: imageQualityCheck,
      categoryAccuracy: categoryAccuracyCheck,
      descriptionAccuracy: descriptionCheck,
      duplicateDetection: duplicateCheck,
      brandAuthenticity: brandCheck
    };

    const violations: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];

    if (!contentPolicyCheck.passed) {
      violations.push(...contentPolicyCheck.issues);
    }
    if (!imageQualityCheck.passed) {
      warnings.push(...imageQualityCheck.issues);
    }
    if (!categoryAccuracyCheck.passed) {
      warnings.push(...categoryAccuracyCheck.issues);
    }
    if (!descriptionCheck.passed) {
      warnings.push(...descriptionCheck.issues);
    }
    if (!duplicateCheck.passed) {
      violations.push(...duplicateCheck.issues);
    }
    if (!brandCheck.passed) {
      warnings.push(...brandCheck.issues);
    }

    if (imageQualityCheck.score < 60) {
      recommendations.push('Add more high-quality product images');
    }
    if (descriptionCheck.score < 60) {
      recommendations.push('Expand product description with more details');
    }
    if (p.tags && p.tags.length < 3) {
      recommendations.push('Add more relevant tags to improve discoverability');
    }

    const scores = [
      contentPolicyCheck.score,
      imageQualityCheck.score,
      categoryAccuracyCheck.score,
      descriptionCheck.score,
      duplicateCheck.score,
      brandCheck.score
    ];

    const overallScore = scores.reduce((a, b) => a + b, 0) / scores.length;

    const approved = violations.length === 0 && overallScore >= this.MIN_AUTO_APPROVE_SCORE;
    const autoApproved = approved && overallScore >= 85;
    const requiresManualReview = !approved || overallScore < this.MIN_AUTO_APPROVE_SCORE;

    return {
      productId,
      approved,
      overallScore: Math.round(overallScore),
      checks,
      violations,
      warnings,
      recommendations,
      autoApproved,
      requiresManualReview
    };
  }

  private static async checkContentPolicy(
    product: typeof marketplaceProducts.$inferSelect
  ): Promise<QACheck> {
    const combinedText = `${product.title} ${product.description} ${product.tags?.join(' ') || ''}`.toLowerCase();

    const prohibitedFound = this.PROHIBITED_KEYWORDS.filter(keyword => 
      combinedText.includes(keyword)
    );

    if (prohibitedFound.length > 0) {
      return {
        passed: false,
        score: 0,
        issues: [
          `Potentially prohibited content detected: ${prohibitedFound.join(', ')}`
        ]
      };
    }

    const adultKeywords = ['adult', 'explicit', 'nsfw', 'mature'];
    const adultFound = adultKeywords.some(keyword => combinedText.includes(keyword));

    if (adultFound) {
      return {
        passed: false,
        score: 20,
        issues: ['Adult content not permitted on this platform']
      };
    }

    return {
      passed: true,
      score: 100,
      issues: []
    };
  }

  private static checkImageQuality(
    product: typeof marketplaceProducts.$inferSelect
  ): QACheck {
    const images = product.mediaUrls || [];
    const issues: string[] = [];
    let score = 100;

    if (images.length === 0) {
      score = 0;
      issues.push('No product images uploaded');
      return {
        passed: false,
        score,
        issues
      };
    }

    if (images.length < this.MIN_IMAGE_COUNT) {
      score -= 30;
      issues.push(`Only ${images.length} image(s) - recommend at least 3`);
    }

    if (images.length >= 3) {
      score = Math.min(score + 20, 100);
    }

    return {
      passed: score >= 50,
      score,
      issues,
      details: {
        imageCount: images.length
      }
    };
  }

  private static checkCategoryAccuracy(
    product: typeof marketplaceProducts.$inferSelect
  ): QACheck {
    const validCategories = ['course', 'music', 'choreography', 'video', 'ebook', 'template', 'tutorial'];

    if (!product.category) {
      return {
        passed: false,
        score: 0,
        issues: ['No category selected']
      };
    }

    if (!validCategories.includes(product.category)) {
      return {
        passed: false,
        score: 30,
        issues: [`Invalid category: ${product.category}`]
      };
    }

    const titleLower = product.title.toLowerCase();
    const categoryHints: Record<string, string[]> = {
      course: ['course', 'class', 'lesson', 'training'],
      music: ['music', 'song', 'track', 'album'],
      choreography: ['choreography', 'routine', 'sequence'],
      video: ['video', 'tutorial', 'recording'],
      ebook: ['ebook', 'book', 'guide', 'manual'],
      template: ['template', 'preset', 'design'],
      tutorial: ['tutorial', 'how-to', 'guide']
    };

    const hints = categoryHints[product.category] || [];
    const matchesCategory = hints.some(hint => titleLower.includes(hint));

    if (!matchesCategory) {
      return {
        passed: true,
        score: 70,
        issues: [`Title may not match category "${product.category}"`]
      };
    }

    return {
      passed: true,
      score: 100,
      issues: []
    };
  }

  private static async checkDescriptionAccuracy(
    product: typeof marketplaceProducts.$inferSelect
  ): Promise<QACheck> {
    const description = product.description;
    const issues: string[] = [];
    let score = 100;

    if (description.length < this.MIN_DESCRIPTION_LENGTH) {
      score = 30;
      issues.push(`Description too short (${description.length} characters - minimum ${this.MIN_DESCRIPTION_LENGTH})`);
      
      return {
        passed: false,
        score,
        issues
      };
    }

    if (description.length >= 200) {
      score = Math.min(score + 10, 100);
    }

    const hasStructure = description.includes('\n') || description.includes('-') || description.includes('•');
    if (!hasStructure && description.length < 150) {
      score -= 15;
      issues.push('Description could benefit from better formatting (bullet points, paragraphs)');
    }

    const spamPatterns = [
      /click here/gi,
      /buy now/gi,
      /limited time/gi,
      /urgent/gi,
      /!!!/g
    ];

    const spamCount = spamPatterns.filter(pattern => pattern.test(description)).length;
    if (spamCount >= 2) {
      score -= 30;
      issues.push('Description contains spam-like language');
    }

    return {
      passed: score >= 60,
      score,
      issues,
      details: {
        length: description.length,
        hasStructure
      }
    };
  }

  private static async detectDuplicates(
    product: typeof marketplaceProducts.$inferSelect
  ): Promise<QACheck> {
    const similarTitles = await db
      .select()
      .from(marketplaceProducts)
      .where(
        and(
          sql`${marketplaceProducts.id} != ${product.id}`,
          eq(marketplaceProducts.creatorUserId, product.creatorUserId),
          eq(marketplaceProducts.status, 'published')
        )
      );

    const duplicates = similarTitles.filter(p => {
      const similarity = this.calculateStringSimilarity(
        product.title.toLowerCase(),
        p.title.toLowerCase()
      );
      return similarity > 0.8;
    });

    if (duplicates.length > 0) {
      return {
        passed: false,
        score: 0,
        issues: [
          `Potential duplicate listing detected: "${duplicates[0].title}"`
        ],
        details: {
          duplicateIds: duplicates.map(d => d.id)
        }
      };
    }

    return {
      passed: true,
      score: 100,
      issues: []
    };
  }

  private static calculateStringSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  private static levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  private static checkBrandAuthenticity(
    product: typeof marketplaceProducts.$inferSelect
  ): QACheck {
    const brandKeywords = [
      'official', 'authentic', 'genuine', 'licensed',
      'nike', 'adidas', 'apple', 'microsoft', 'adobe'
    ];

    const text = `${product.title} ${product.description}`.toLowerCase();
    const foundBrands = brandKeywords.filter(brand => text.includes(brand));

    if (foundBrands.length > 0) {
      return {
        passed: true,
        score: 60,
        issues: [
          `Brand references detected: ${foundBrands.join(', ')} - verify authenticity`
        ],
        details: {
          brands: foundBrands
        }
      };
    }

    return {
      passed: true,
      score: 100,
      issues: []
    };
  }

  static async autoApproveProduct(productId: number): Promise<{
    approved: boolean;
    reason: string;
  }> {
    const qaResult = await this.reviewListing(productId);

    if (qaResult.autoApproved) {
      await db
        .update(marketplaceProducts)
        .set({ status: 'published' })
        .where(eq(marketplaceProducts.id, productId));

      return {
        approved: true,
        reason: `Auto-approved with score ${qaResult.overallScore}/100`
      };
    }

    if (qaResult.requiresManualReview) {
      return {
        approved: false,
        reason: `Requires manual review (score: ${qaResult.overallScore}/100, violations: ${qaResult.violations.length})`
      };
    }

    return {
      approved: false,
      reason: `Failed QA review: ${qaResult.violations.join('; ')}`
    };
  }

  static async getQAQueue(): Promise<Array<{
    productId: number;
    productTitle: string;
    sellerName: string;
    submittedAt: Date;
    priority: 'low' | 'medium' | 'high';
  }>> {
    const pendingProducts = await db
      .select({
        product: marketplaceProducts,
        seller: users
      })
      .from(marketplaceProducts)
      .innerJoin(users, eq(marketplaceProducts.creatorUserId, users.id))
      .where(eq(marketplaceProducts.status, 'draft'))
      .orderBy(desc(marketplaceProducts.createdAt))
      .limit(50);

    return pendingProducts.map(p => {
      const daysSinceCreation = Math.floor(
        (Date.now() - p.product.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      );

      let priority: 'low' | 'medium' | 'high';
      if (daysSinceCreation > 7) priority = 'high';
      else if (daysSinceCreation > 3) priority = 'medium';
      else priority = 'low';

      return {
        productId: p.product.id,
        productTitle: p.product.title,
        sellerName: p.seller.name,
        submittedAt: p.product.createdAt,
        priority
      };
    });
  }

  static async batchReview(productIds: number[]): Promise<Array<{
    productId: number;
    result: QAResult;
  }>> {
    const results = await Promise.all(
      productIds.map(async (id) => {
        try {
          const result = await this.reviewListing(id);
          return { productId: id, result };
        } catch (error) {
          console.error(`[QA] Error reviewing product ${id}:`, error);
          return null;
        }
      })
    );

    return results.filter((r): r is { productId: number; result: QAResult } => r !== null);
  }
}
