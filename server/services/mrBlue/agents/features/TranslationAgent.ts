/**
 * TranslationAgent - Dedicated agent for managing translations
 * 
 * MB.MD Translation Agent v1.0
 * Handles:
 * - Translation coverage audits
 * - Missing key detection
 * - Bulk translation generation
 * - Quality validation
 * - Sync between directories
 */

import * as fs from 'fs';
import * as path from 'path';

export interface TranslationCoverage {
  language: string;
  namespace: string;
  totalKeys: number;
  translatedKeys: number;
  missingKeys: string[];
  coverage: number;
}

export interface TranslationAuditReport {
  timestamp: Date;
  totalLanguages: number;
  completeLanguages: string[];
  incompleteLanguages: { language: string; coverage: number }[];
  priorityActions: string[];
}

export interface TranslationSection {
  sectionName: string;
  keys: Record<string, unknown>;
}

const SUPPORTED_NAMESPACES = ['common', 'navigation', 'pages', 'errors'];

const PRIORITY_LANGUAGES = [
  'es', 'pt', 'pt-br', 'fr', 'de', 'it', 'ru', 
  'zh', 'zh-tw', 'zh-hk', 'ja', 'ko', 'ar'
];

const CLIENT_LOCALES_DIR = 'client/public/locales';
const BACKUP_LOCALES_DIR = 'public/locales';

export class TranslationAgent {
  private localesDir: string;
  private backupDir: string;

  constructor() {
    this.localesDir = CLIENT_LOCALES_DIR;
    this.backupDir = BACKUP_LOCALES_DIR;
  }

  /**
   * Get all translation keys from an object recursively
   */
  private getKeys(obj: Record<string, unknown>, prefix = ''): string[] {
    let keys: string[] = [];
    for (const key in obj) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        keys = keys.concat(this.getKeys(obj[key] as Record<string, unknown>, fullKey));
      } else {
        keys.push(fullKey);
      }
    }
    return keys;
  }

  /**
   * Get value from nested object by dot-notation key
   */
  private getNestedValue(obj: Record<string, unknown>, key: string): unknown {
    return key.split('.').reduce((o, k) => (o && typeof o === 'object' ? (o as Record<string, unknown>)[k] : undefined), obj);
  }

  /**
   * Set value in nested object by dot-notation key
   */
  private setNestedValue(obj: Record<string, unknown>, key: string, value: unknown): void {
    const keys = key.split('.');
    const lastKey = keys.pop()!;
    let current = obj;
    
    for (const k of keys) {
      if (!(k in current) || typeof current[k] !== 'object') {
        current[k] = {};
      }
      current = current[k] as Record<string, unknown>;
    }
    
    current[lastKey] = value;
  }

  /**
   * Get all available languages
   */
  getLanguages(): string[] {
    try {
      return fs.readdirSync(this.localesDir).filter(f => 
        fs.statSync(path.join(this.localesDir, f)).isDirectory()
      );
    } catch {
      return [];
    }
  }

  /**
   * Load a namespace file for a language
   */
  loadNamespace(language: string, namespace: string): Record<string, unknown> | null {
    const filePath = path.join(this.localesDir, language, `${namespace}.json`);
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(content);
    } catch {
      return null;
    }
  }

  /**
   * Save a namespace file for a language
   */
  saveNamespace(language: string, namespace: string, data: Record<string, unknown>): boolean {
    const clientPath = path.join(this.localesDir, language, `${namespace}.json`);
    const backupPath = path.join(this.backupDir, language, `${namespace}.json`);

    try {
      const content = JSON.stringify(data, null, 2);
      
      fs.mkdirSync(path.dirname(clientPath), { recursive: true });
      fs.writeFileSync(clientPath, content, 'utf8');
      
      fs.mkdirSync(path.dirname(backupPath), { recursive: true });
      fs.writeFileSync(backupPath, content, 'utf8');
      
      return true;
    } catch (error) {
      console.error(`Failed to save ${language}/${namespace}:`, error);
      return false;
    }
  }

  /**
   * Audit a single language for translation coverage
   */
  auditLanguage(language: string): TranslationCoverage[] {
    const results: TranslationCoverage[] = [];
    const enDir = path.join(this.localesDir, 'en');

    for (const namespace of SUPPORTED_NAMESPACES) {
      const enFile = path.join(enDir, `${namespace}.json`);
      if (!fs.existsSync(enFile)) continue;

      const enData = this.loadNamespace('en', namespace);
      if (!enData) continue;

      const enKeys = this.getKeys(enData);
      const langData = this.loadNamespace(language, namespace);
      
      if (!langData) {
        results.push({
          language,
          namespace,
          totalKeys: enKeys.length,
          translatedKeys: 0,
          missingKeys: enKeys,
          coverage: 0
        });
        continue;
      }

      const langKeys = this.getKeys(langData);
      const missingKeys = enKeys.filter(k => !langKeys.includes(k));

      results.push({
        language,
        namespace,
        totalKeys: enKeys.length,
        translatedKeys: enKeys.length - missingKeys.length,
        missingKeys,
        coverage: ((enKeys.length - missingKeys.length) / enKeys.length) * 100
      });
    }

    return results;
  }

  /**
   * Full audit of all languages
   */
  auditAll(): TranslationAuditReport {
    const languages = this.getLanguages().filter(l => l !== 'en');
    const completeLanguages: string[] = [];
    const incompleteLanguages: { language: string; coverage: number }[] = [];
    const priorityActions: string[] = [];

    for (const lang of languages) {
      const coverage = this.auditLanguage(lang);
      const totalCoverage = coverage.reduce((sum, c) => sum + c.coverage, 0) / coverage.length;

      if (totalCoverage >= 99) {
        completeLanguages.push(lang);
      } else {
        incompleteLanguages.push({ language: lang, coverage: Math.round(totalCoverage) });
        
        if (PRIORITY_LANGUAGES.includes(lang) && totalCoverage < 80) {
          const missingCount = coverage.reduce((sum, c) => sum + c.missingKeys.length, 0);
          priorityActions.push(`${lang.toUpperCase()}: Add ${missingCount} missing translations (${Math.round(totalCoverage)}% complete)`);
        }
      }
    }

    incompleteLanguages.sort((a, b) => b.coverage - a.coverage);

    return {
      timestamp: new Date(),
      totalLanguages: languages.length,
      completeLanguages,
      incompleteLanguages,
      priorityActions
    };
  }

  /**
   * Get missing keys for a specific section
   */
  getMissingSectionKeys(language: string, sectionName: string): string[] {
    const enData = this.loadNamespace('en', 'pages');
    const langData = this.loadNamespace(language, 'pages');
    
    if (!enData || !langData) return [];

    const section = (enData as Record<string, unknown>)[sectionName];
    if (!section) return [];

    const enKeys = this.getKeys({ [sectionName]: section });
    const langKeys = this.getKeys(langData);

    return enKeys.filter(k => !langKeys.includes(k));
  }

  /**
   * Get English source content for a section
   */
  getEnglishSection(sectionName: string): TranslationSection | null {
    const enData = this.loadNamespace('en', 'pages');
    if (!enData) return null;

    const section = (enData as Record<string, unknown>)[sectionName];
    if (!section) return null;

    return {
      sectionName,
      keys: section as Record<string, unknown>
    };
  }

  /**
   * Add a translation section to a language
   */
  addSection(language: string, sectionName: string, translations: Record<string, unknown>): boolean {
    const langData = this.loadNamespace(language, 'pages') || {};
    (langData as Record<string, unknown>)[sectionName] = translations;
    return this.saveNamespace(language, 'pages', langData);
  }

  /**
   * Fill missing keys with English fallback (for testing)
   */
  fillMissingKeysWithFallback(language: string, namespace: string = 'pages'): number {
    const enData = this.loadNamespace('en', namespace);
    const langData = this.loadNamespace(language, namespace) || {};
    
    if (!enData) return 0;

    const enKeys = this.getKeys(enData);
    const langKeys = this.getKeys(langData);
    const missingKeys = enKeys.filter(k => !langKeys.includes(k));

    let filled = 0;
    for (const key of missingKeys) {
      const enValue = this.getNestedValue(enData, key);
      if (enValue !== undefined) {
        this.setNestedValue(langData, key, enValue);
        filled++;
      }
    }

    if (filled > 0) {
      this.saveNamespace(language, namespace, langData);
    }

    return filled;
  }

  /**
   * Sync client locales to backup directory
   */
  syncToBackup(): { synced: number; errors: string[] } {
    const errors: string[] = [];
    let synced = 0;

    const languages = this.getLanguages();
    for (const lang of languages) {
      for (const ns of SUPPORTED_NAMESPACES) {
        const clientPath = path.join(this.localesDir, lang, `${ns}.json`);
        const backupPath = path.join(this.backupDir, lang, `${ns}.json`);

        if (!fs.existsSync(clientPath)) continue;

        try {
          fs.mkdirSync(path.dirname(backupPath), { recursive: true });
          fs.copyFileSync(clientPath, backupPath);
          synced++;
        } catch (error) {
          errors.push(`Failed to sync ${lang}/${ns}: ${error}`);
        }
      }
    }

    return { synced, errors };
  }

  /**
   * Get translation summary for display
   */
  getSummary(): string {
    const report = this.auditAll();
    
    let summary = `# Translation Status Report\n`;
    summary += `Generated: ${report.timestamp.toISOString()}\n\n`;
    summary += `## Overview\n`;
    summary += `- Total Languages: ${report.totalLanguages}\n`;
    summary += `- Complete: ${report.completeLanguages.length}\n`;
    summary += `- Incomplete: ${report.incompleteLanguages.length}\n\n`;
    
    if (report.priorityActions.length > 0) {
      summary += `## Priority Actions\n`;
      for (const action of report.priorityActions) {
        summary += `- ${action}\n`;
      }
      summary += '\n';
    }

    summary += `## Complete Languages\n`;
    summary += report.completeLanguages.join(', ') || 'None';
    summary += '\n\n';

    summary += `## Incomplete Languages (Top 10)\n`;
    for (const lang of report.incompleteLanguages.slice(0, 10)) {
      summary += `- ${lang.language}: ${lang.coverage}%\n`;
    }

    return summary;
  }
}

export const translationAgent = new TranslationAgent();
export default translationAgent;
