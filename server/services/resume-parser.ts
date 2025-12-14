/**
 * RESUME PARSER SERVICE
 * MB.MD Enhanced Version - Dec 14, 2025
 * 
 * Extracts text from PDF and DOCX resumes
 * Used by Talent Match AI for signal detection
 * 
 * Features:
 * - Enhanced buffer diagnostics
 * - Multiple PDF parsing fallback strategies
 * - Detailed error logging for debugging
 */

import mammoth from "mammoth";
import { createRequire } from "module";

// pdf-parse with multiple import strategies
let pdfParse: any = null;
let pdfParseLoadAttempted = false;

async function getPdfParse() {
  if (pdfParseLoadAttempted) return pdfParse;
  pdfParseLoadAttempted = true;
  
  console.log("[Resume Parser] 🔧 Attempting to load pdf-parse...");
  
  // Strategy 1: Use createRequire (most reliable for CommonJS in ESM)
  try {
    const require = createRequire(import.meta.url);
    const parser = require('pdf-parse');
    if (typeof parser === 'function') {
      pdfParse = parser;
      console.log("[Resume Parser] ✅ pdf-parse loaded via createRequire (function)");
      return pdfParse;
    }
    if (typeof parser.default === 'function') {
      pdfParse = parser.default;
      console.log("[Resume Parser] ✅ pdf-parse loaded via createRequire (default)");
      return pdfParse;
    }
  } catch (err: any) {
    console.log("[Resume Parser] ⚠️ createRequire strategy failed:", err?.message);
  }
  
  // Strategy 2: Dynamic import with various export patterns
  try {
    const module = await import("pdf-parse");
    console.log("[Resume Parser] 🔍 Dynamic import result keys:", Object.keys(module));
    
    if (typeof module.default === 'function') {
      pdfParse = module.default;
      console.log("[Resume Parser] ✅ pdf-parse loaded via dynamic import (default)");
      return pdfParse;
    }
    if (typeof module.default?.default === 'function') {
      pdfParse = module.default.default;
      console.log("[Resume Parser] ✅ pdf-parse loaded via dynamic import (nested default)");
      return pdfParse;
    }
    if (typeof module === 'function') {
      pdfParse = module;
      console.log("[Resume Parser] ✅ pdf-parse loaded via dynamic import (module itself)");
      return pdfParse;
    }
    
    // Check for any callable export
    for (const key of Object.keys(module)) {
      if (typeof (module as any)[key] === 'function') {
        pdfParse = (module as any)[key];
        console.log(`[Resume Parser] ✅ pdf-parse loaded via dynamic import (key: ${key})`);
        return pdfParse;
      }
    }
  } catch (err: any) {
    console.log("[Resume Parser] ⚠️ Dynamic import strategy failed:", err?.message);
  }
  
  console.error("[Resume Parser] ❌ All pdf-parse loading strategies failed");
  return null;
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
    console.log("[Resume Parser] 📄 parseResume called");
    console.log("[Resume Parser] 📄 Filename:", filename);
    console.log("[Resume Parser] 📄 Buffer.isBuffer:", Buffer.isBuffer(buffer));
    console.log("[Resume Parser] 📄 Buffer length:", buffer?.length || 0, "bytes");
    
    // Validate buffer
    if (!Buffer.isBuffer(buffer)) {
      console.error("[Resume Parser] ❌ Invalid input: not a Buffer");
      console.log("[Resume Parser] 📊 Input type:", typeof buffer);
      console.log("[Resume Parser] 📊 Input constructor:", buffer?.constructor?.name);
      return { text: "", skills: [], links: [], signals: [] };
    }
    
    if (buffer.length === 0) {
      console.error("[Resume Parser] ❌ Empty buffer received");
      return { text: "", skills: [], links: [], signals: [] };
    }
    
    // Log first 20 bytes for debugging (PDF signature: %PDF)
    const header = buffer.slice(0, 20).toString('utf8', 0, 20);
    console.log("[Resume Parser] 📊 Buffer header (first 20 bytes):", JSON.stringify(header));
    
    const extension = filename.toLowerCase().split('.').pop();
    console.log("[Resume Parser] 📄 Detected extension:", extension);
    
    let text = "";
    
    if (extension === "pdf") {
      // Verify PDF signature
      if (!header.startsWith('%PDF')) {
        console.warn("[Resume Parser] ⚠️ Buffer does not have PDF signature (%PDF)");
        console.log("[Resume Parser] 🔧 Attempting parse anyway...");
      }
      text = await this.parsePDF(buffer);
    } else if (extension === "docx") {
      text = await this.parseDOCX(buffer);
    } else if (extension === "txt") {
      // Direct text file handling
      text = buffer.toString('utf8');
      console.log("[Resume Parser] ✅ TXT file parsed, length:", text.length);
    } else {
      console.error("[Resume Parser] ❌ Unsupported file format:", extension);
      return { text: "", skills: [], links: [], signals: [] };
    }
    
    console.log("[Resume Parser] 📊 Final extracted text length:", text.length, "chars");
    
    const skills = this.extractSkills(text);
    const links = this.extractLinks(text);
    const signals = this.detectSignals(text);
    
    console.log("[Resume Parser] 📊 Detected skills:", skills.length);
    console.log("[Resume Parser] 📊 Detected links:", links.length);
    console.log("[Resume Parser] 📊 Detected signals:", signals);
    
    return {
      text,
      skills,
      links,
      signals,
    };
  }
  
  /**
   * Parse PDF resume with multiple fallback strategies
   */
  private async parsePDF(buffer: Buffer): Promise<string> {
    console.log("[Resume Parser] 🔄 Starting PDF parse pipeline...");
    console.log("[Resume Parser] 📊 PDF buffer size:", buffer.length, "bytes");
    
    // Strategy 1: Try pdf-parse library
    try {
      const parser = await getPdfParse();
      if (parser) {
        console.log("[Resume Parser] 🔧 Calling pdf-parse with buffer...");
        
        const data = await parser(buffer, {
          // Options to improve text extraction
          max: 0, // No page limit
        });
        
        console.log("[Resume Parser] 📊 pdf-parse returned:");
        console.log("[Resume Parser] 📊 - numpages:", data?.numpages);
        console.log("[Resume Parser] 📊 - numrender:", data?.numrender);
        console.log("[Resume Parser] 📊 - text length:", data?.text?.length || 0);
        console.log("[Resume Parser] 📊 - info:", JSON.stringify(data?.info || {}).slice(0, 200));
        
        const extractedText = data?.text || "";
        
        if (extractedText.length > 0) {
          console.log("[Resume Parser] ✅ pdf-parse SUCCESS!");
          console.log("[Resume Parser] 📄 First 300 chars:", extractedText.slice(0, 300));
          return extractedText;
        } else {
          console.warn("[Resume Parser] ⚠️ pdf-parse returned empty text");
          console.log("[Resume Parser] 📊 This PDF may be image-based or have unusual encoding");
        }
      }
    } catch (error: any) {
      console.error("[Resume Parser] ❌ pdf-parse error:", error?.message);
      console.error("[Resume Parser] 📊 Error stack:", error?.stack?.split('\n').slice(0, 3).join('\n'));
    }
    
    // Strategy 2: Try to extract any readable ASCII text from PDF
    console.log("[Resume Parser] 🔧 Attempting raw text extraction fallback...");
    try {
      const rawText = this.extractRawTextFromPDF(buffer);
      if (rawText.length > 50) {
        console.log("[Resume Parser] ✅ Raw text extraction found", rawText.length, "chars");
        console.log("[Resume Parser] 📄 First 300 chars:", rawText.slice(0, 300));
        return rawText;
      }
    } catch (err: any) {
      console.log("[Resume Parser] ⚠️ Raw text extraction failed:", err?.message);
    }
    
    console.error("[Resume Parser] ❌ All PDF parsing strategies failed");
    console.log("[Resume Parser] 💡 Recommendation: This PDF may need OCR for image-based content");
    return "";
  }
  
  /**
   * Fallback: Extract readable text directly from PDF bytes
   * This catches text that's embedded in the PDF structure
   */
  private extractRawTextFromPDF(buffer: Buffer): string {
    const content = buffer.toString('latin1');
    
    // Extract text between BT (Begin Text) and ET (End Text) markers
    const textChunks: string[] = [];
    const btEtPattern = /BT[\s\S]*?ET/g;
    let match;
    
    while ((match = btEtPattern.exec(content)) !== null) {
      // Extract text from Tj or TJ operators
      const tjPattern = /\(([^)]+)\)\s*Tj/g;
      let tjMatch;
      while ((tjMatch = tjPattern.exec(match[0])) !== null) {
        const text = tjMatch[1]
          .replace(/\\n/g, '\n')
          .replace(/\\r/g, '')
          .replace(/\\t/g, ' ')
          .replace(/\\\(/g, '(')
          .replace(/\\\)/g, ')')
          .replace(/\\\\/g, '\\');
        if (text.length > 1 && /[a-zA-Z]/.test(text)) {
          textChunks.push(text);
        }
      }
    }
    
    // Also try to find plain text streams
    const streamPattern = /stream[\r\n]+([\s\S]*?)[\r\n]+endstream/g;
    while ((match = streamPattern.exec(content)) !== null) {
      const streamContent = match[1];
      // Extract printable ASCII sequences
      const readableText = streamContent.match(/[a-zA-Z][a-zA-Z0-9\s,.\-@:\/]{10,}/g);
      if (readableText) {
        textChunks.push(...readableText);
      }
    }
    
    const result = textChunks.join(' ').replace(/\s+/g, ' ').trim();
    return result;
  }
  
  /**
   * Parse DOCX resume
   */
  private async parseDOCX(buffer: Buffer): Promise<string> {
    console.log("[Resume Parser] 📄 Parsing DOCX file...");
    try {
      const result = await mammoth.extractRawText({ buffer });
      console.log("[Resume Parser] ✅ DOCX parsed, text length:", result.value.length);
      return result.value;
    } catch (error: any) {
      console.error("[Resume Parser] ❌ DOCX parsing error:", error?.message);
      return "";
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
      "kubernetes", "git", "testing", "qa", "security", "blockchain", "web3",
      "angular", "vue", "express", "django", "flask", "rust", "go", "swift",
      "kotlin", "ruby", "php", "mysql", "postgresql", "redis", "elasticsearch",
      "graphql", "rest api", "microservices", "cloud", "linux", "nginx"
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
