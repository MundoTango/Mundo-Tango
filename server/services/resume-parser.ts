/**
 * RESUME PARSER SERVICE
 * Extracts text from PDF and DOCX resumes
 * Used by Talent Match AI for signal detection
 */

import mammoth from "mammoth";

// pdf-parse dynamic import for CommonJS compatibility
let pdfParse: any = null;

async function getPdfParse() {
  if (!pdfParse) {
    try {
      // Dynamic import for ESM compatibility
      const module = await import("pdf-parse");
      // pdf-parse exports differently in ESM vs CommonJS
      // Try multiple ways to get the actual function
      if (typeof module.default === 'function') {
        pdfParse = module.default;
      } else if (typeof module.default?.default === 'function') {
        pdfParse = module.default.default;
      } else if (typeof module === 'function') {
        pdfParse = module;
      } else {
        // Use require as fallback for CommonJS modules
        const { createRequire } = await import('module');
        const require = createRequire(import.meta.url);
        pdfParse = require('pdf-parse');
      }
      console.log("[Resume Parser] ✅ pdf-parse loaded successfully, type:", typeof pdfParse);
    } catch (err) {
      console.error("[Resume Parser] ❌ Failed to load pdf-parse:", err);
    }
  }
  return pdfParse;
}

export interface ParsedResume {
  text: string;
  skills: string[];
  links: string[];
  signals: string[];
}

export class ResumeParser {
  /**
   * Parse resume from buffer (PDF or DOCX)
   */
  async parseResume(buffer: Buffer, filename: string): Promise<ParsedResume> {
    const extension = filename.toLowerCase().split('.').pop();
    
    let text = "";
    
    if (extension === "pdf") {
      text = await this.parsePDF(buffer);
    } else if (extension === "docx") {
      text = await this.parseDOCX(buffer);
    } else {
      throw new Error(`Unsupported file format: ${extension}`);
    }
    
    const skills = this.extractSkills(text);
    const links = this.extractLinks(text);
    const signals = this.detectSignals(text);
    
    return {
      text,
      skills,
      links,
      signals,
    };
  }
  
  /**
   * Parse PDF resume
   */
  private async parsePDF(buffer: Buffer): Promise<string> {
    console.log("[Resume Parser] 📄 Starting PDF parse, buffer size:", buffer.length, "bytes");
    try {
      const parser = await getPdfParse();
      if (!parser) {
        console.error("[Resume Parser] ❌ pdf-parse module not available");
        return "";
      }
      const data = await parser(buffer);
      const extractedText = data.text || "";
      console.log("[Resume Parser] ✅ PDF parsed successfully, text length:", extractedText.length, "chars");
      if (extractedText.length > 0) {
        console.log("[Resume Parser] First 200 chars:", extractedText.slice(0, 200));
      } else {
        console.warn("[Resume Parser] ⚠️ PDF parsed but no text extracted - may be image-based or encrypted");
      }
      return extractedText;
    } catch (error: any) {
      console.error("[Resume Parser] ❌ PDF parsing error:", error?.message || error);
      // Return empty string instead of throwing - allows flow to continue
      // This handles minimal/test PDFs that may not have valid structure
      return "";
    }
  }
  
  /**
   * Parse DOCX resume
   */
  private async parseDOCX(buffer: Buffer): Promise<string> {
    try {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    } catch (error) {
      console.error("[Resume Parser] DOCX parsing error:", error);
      throw new Error("Failed to parse DOCX resume");
    }
  }
  
  /**
   * Extract skills from resume text
   */
  private extractSkills(text: string): string[] {
    const skillKeywords = [
      "javascript", "typescript", "react", "node.js", "python", "java", "c++",
      "backend", "frontend", "full-stack", "devops", "machine learning", "ai",
      "design", "ui/ux", "figma", "photoshop", "marketing", "seo", "content writing",
      "project management", "agile", "scrum", "sql", "mongodb", "aws", "docker",
      "kubernetes", "git", "testing", "qa", "security", "blockchain", "web3"
    ];
    
    const lowerText = text.toLowerCase();
    const foundSkills: string[] = [];
    
    for (const skill of skillKeywords) {
      if (lowerText.includes(skill)) {
        foundSkills.push(skill);
      }
    }
    
    return Array.from(new Set(foundSkills));
  }
  
  /**
   * Extract links (GitHub, LinkedIn, portfolio, etc.)
   */
  private extractLinks(text: string): string[] {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const matches = text.match(urlRegex) || [];
    
    return matches.filter(url => 
      url.includes("github.com") ||
      url.includes("linkedin.com") ||
      url.includes("portfolio") ||
      url.includes("behance.net") ||
      url.includes("dribbble.com")
    );
  }
  
  /**
   * Detect ESA agent signals (backend, frontend, security, etc.)
   */
  private detectSignals(text: string): string[] {
    const signals: string[] = [];
    const lowerText = text.toLowerCase();
    
    // Backend signals
    if (lowerText.match(/backend|server|api|database|node\.?js|express|django|flask|spring/i)) {
      signals.push("backend");
    }
    
    // Frontend signals
    if (lowerText.match(/frontend|react|vue|angular|ui|ux|css|html|tailwind|bootstrap/i)) {
      signals.push("frontend");
    }
    
    // Security signals
    if (lowerText.match(/security|encryption|authentication|authorization|oauth|jwt|penetration|cybersecurity/i)) {
      signals.push("security");
    }
    
    // DevOps signals
    if (lowerText.match(/devops|ci\/cd|docker|kubernetes|aws|azure|gcp|terraform|jenkins/i)) {
      signals.push("devops");
    }
    
    // ML/AI signals
    if (lowerText.match(/machine learning|ai|artificial intelligence|tensorflow|pytorch|nlp|computer vision/i)) {
      signals.push("ml-ai");
    }
    
    // Design signals
    if (lowerText.match(/design|figma|sketch|photoshop|illustrator|ui\/ux|graphic design/i)) {
      signals.push("design");
    }
    
    // Marketing signals
    if (lowerText.match(/marketing|seo|content|social media|analytics|growth|campaign/i)) {
      signals.push("marketing");
    }
    
    // PM signals
    if (lowerText.match(/project manager|product manager|agile|scrum|jira|roadmap/i)) {
      signals.push("project-management");
    }
    
    return Array.from(new Set(signals));
  }
}

export const resumeParser = new ResumeParser();
