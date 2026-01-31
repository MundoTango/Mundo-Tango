/**
 * RESUME PARSER SERVICE
 * MB.MD v2 Enhanced - Dec 14, 2025
 * 
 * Extracts text from PDF and DOCX resumes
 * Used by Talent Match AI for signal detection
 * 
 * FIXED: Updated to use pdf-parse v2 API
 * - v2 uses: new PDFParse({ data: buffer })
 * - Must call .getText() and access result.text
 * - Must call .destroy() to clean up
 */

import mammoth from "mammoth";
import { createRequire } from "module";

// pdf-parse v2 class (PDFParse)
let PDFParseClass: any = null;
let pdfParseLoadAttempted = false;

async function getPDFParseClass() {
  if (pdfParseLoadAttempted) return PDFParseClass;
  pdfParseLoadAttempted = true;
  
  console.log("[Resume Parser] 🔧 Loading pdf-parse v2...");
  
  try {
    const require = createRequire(import.meta.url);
    const pdfModule = require('pdf-parse');
    
    // v2 API exports PDFParse class
    if (pdfModule.PDFParse) {
      PDFParseClass = pdfModule.PDFParse;
      console.log("[Resume Parser] ✅ pdf-parse v2 PDFParse class loaded");
      return PDFParseClass;
    }
    
    // Fallback: check for default export
    if (typeof pdfModule.default?.PDFParse === 'function') {
      PDFParseClass = pdfModule.default.PDFParse;
      console.log("[Resume Parser] ✅ pdf-parse v2 PDFParse loaded from default");
      return PDFParseClass;
    }
    
    console.log("[Resume Parser] 📊 pdf-parse exports:", Object.keys(pdfModule));
  } catch (err: any) {
    console.error("[Resume Parser] ❌ Failed to load pdf-parse:", err?.message);
  }
  
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
    
    // DEBUG: Log the full buffer for inspection if it's small, or size if large
    console.log(`[Resume Parser] 📊 Buffer total size: ${buffer.length} bytes`);
    
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
   * Parse PDF resume using pdf-parse v2 API
   * v2 uses: new PDFParse({ data: buffer }) + getText() + destroy()
   */
  private async parsePDF(buffer: Buffer): Promise<string> {
    console.log("[Resume Parser] 🔄 Starting PDF parse (v2 API)...");
    console.log("[Resume Parser] 📊 PDF buffer size:", buffer.length, "bytes");
    
    // Strategy 1: Try pdf-parse v2 library
    let parser: any = null;
    try {
      const PDFParse = await getPDFParseClass();
      if (PDFParse) {
        console.log("[Resume Parser] 🔧 Creating PDFParse instance...");
        
        // v2 API: pass buffer as { data: buffer }
        parser = new PDFParse({ data: buffer });
        
        console.log("[Resume Parser] 🔧 Calling getText()...");
        const result = await parser.getText();
        
        console.log("[Resume Parser] 📊 pdf-parse v2 result:");
        console.log("[Resume Parser] 📊 - total pages:", result?.total);
        console.log("[Resume Parser] 📊 - text length:", result?.text?.length || 0);
        
        const extractedText = result?.text || "";
        
        if (extractedText.length > 0) {
          console.log("[Resume Parser] ✅ pdf-parse v2 SUCCESS!");
          console.log("[Resume Parser] 📄 First 300 chars:", extractedText.slice(0, 300));
          return extractedText;
        } else {
          console.warn("[Resume Parser] ⚠️ pdf-parse v2 returned empty text");
          console.log("[Resume Parser] 📊 This PDF may be image-based or have unusual encoding");
        }
      }
    } catch (error: any) {
      console.error("[Resume Parser] ❌ pdf-parse v2 error:", error?.message);
      console.error("[Resume Parser] 📊 Error stack:", error?.stack?.split('\n').slice(0, 3).join('\n'));
    } finally {
      // v2 requires cleanup
      if (parser && typeof parser.destroy === 'function') {
        try {
          await parser.destroy();
          console.log("[Resume Parser] 🧹 Parser destroyed (memory cleanup)");
        } catch (e) {
          // Ignore cleanup errors
        }
      }
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
