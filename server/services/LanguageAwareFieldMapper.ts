/**
 * MB.MD v9.9.3: Language-Aware Field Mapper
 * 
 * Detects page language and maps multilingual field labels to canonical fields.
 * Supports Spanish, Portuguese, German, French, Italian, English.
 */

export type CanonicalField = 
  | 'organizer' | 'dj' | 'teacher' | 'orchestra' | 'performer' | 'host'
  | 'venue' | 'address' | 'price' | 'time' | 'date' | 'status' | 'description'
  | 'coverImage' | 'eventType';

export type SupportedLanguage = 'es' | 'pt' | 'de' | 'fr' | 'it' | 'en';

interface FieldMapping {
  patterns: RegExp[];
  canonical: CanonicalField;
}

interface LanguageMappings {
  [language: string]: FieldMapping[];
}

const LANGUAGE_MAPPINGS: LanguageMappings = {
  es: [
    { patterns: [/organizador(es)?/i, /organiza(n|do)?/i, /presenta(n)?/i, /produce(n)?/i], canonical: 'organizer' },
    { patterns: [/\btdj\b/i, /\bdj\b/i, /musicalizador(a|es)?/i, /musicaliza(n)?/i], canonical: 'dj' },
    { patterns: [/maestro(s)?/i, /profesor(es|a|as)?/i, /clase(s)? (de|con)/i, /enseña(n)?/i, /docente(s)?/i], canonical: 'teacher' },
    { patterns: [/orquesta/i, /música en vivo/i, /en vivo/i, /banda/i, /quinteto/i, /cuarteto/i, /trío/i], canonical: 'orchestra' },
    { patterns: [/show (de)?/i, /exhibición/i, /artista(s)?/i, /baila(n)?/i, /performer(s)?/i], canonical: 'performer' },
    { patterns: [/anfitrión/i, /host(s)?/i, /recibe(n)?/i], canonical: 'host' },
    { patterns: [/lugar/i, /salón/i, /local/i, /espacio/i, /sede/i, /venue/i], canonical: 'venue' },
    { patterns: [/dirección/i, /ubicación/i, /dónde/i, /calle/i, /av\./i, /avenida/i], canonical: 'address' },
    { patterns: [/precio/i, /entrada/i, /costo/i, /valor/i, /\$\s*\d+/i, /gratis/i, /libre/i, /bono/i], canonical: 'price' },
    { patterns: [/hora(s)?/i, /horario/i, /desde/i, /hasta/i, /\d{1,2}:\d{2}/], canonical: 'time' },
    { patterns: [/fecha/i, /día/i, /cuando/i, /lunes|martes|miércoles|jueves|viernes|sábado|domingo/i], canonical: 'date' },
    { patterns: [/cancelado/i, /suspendido/i, /reprogramado/i, /confirmado/i, /agotado/i], canonical: 'status' },
    { patterns: [/milonga/i, /práctica/i, /clase/i, /taller/i, /festival/i, /encuentro/i, /marathon/i], canonical: 'eventType' },
  ],
  pt: [
    { patterns: [/organizador(es)?/i, /organiza(m)?/i, /apresenta(m)?/i, /produz(em)?/i], canonical: 'organizer' },
    { patterns: [/\btdj\b/i, /\bdj\b/i, /musicalizador(a)?/i], canonical: 'dj' },
    { patterns: [/mestre(s)?/i, /professor(es|a)?/i, /aula(s)? (de|com)/i], canonical: 'teacher' },
    { patterns: [/orquestra/i, /música ao vivo/i, /ao vivo/i, /banda/i, /quinteto/i], canonical: 'orchestra' },
    { patterns: [/show (de)?/i, /exibição/i, /artista(s)?/i, /dança(m)?/i], canonical: 'performer' },
    { patterns: [/anfitrião/i, /host(s)?/i], canonical: 'host' },
    { patterns: [/lugar/i, /salão/i, /local/i, /espaço/i, /sede/i], canonical: 'venue' },
    { patterns: [/endereço/i, /localização/i, /onde/i, /rua/i, /av\./i, /avenida/i], canonical: 'address' },
    { patterns: [/preço/i, /entrada/i, /custo/i, /valor/i, /r\$\s*\d+/i, /grátis/i, /livre/i], canonical: 'price' },
    { patterns: [/hora(s)?/i, /horário/i, /das/i, /às/i, /\d{1,2}:\d{2}/], canonical: 'time' },
    { patterns: [/data/i, /dia/i, /quando/i, /segunda|terça|quarta|quinta|sexta|sábado|domingo/i], canonical: 'date' },
    { patterns: [/cancelado/i, /suspenso/i, /remarcado/i, /confirmado/i, /esgotado/i], canonical: 'status' },
    { patterns: [/milonga/i, /prática/i, /aula/i, /workshop/i, /festival/i, /encontro/i], canonical: 'eventType' },
  ],
  de: [
    { patterns: [/veranstalter/i, /organisator(en)?/i, /organisiert/i], canonical: 'organizer' },
    { patterns: [/dj/i, /musikauswahl/i], canonical: 'dj' },
    { patterns: [/lehrer(in)?/i, /maestro(s)?/i, /unterricht/i, /kurs/i], canonical: 'teacher' },
    { patterns: [/orchester/i, /live(-| )?musik/i, /band/i, /quintett/i], canonical: 'orchestra' },
    { patterns: [/show/i, /aufführung/i, /künstler/i, /tänzer/i], canonical: 'performer' },
    { patterns: [/gastgeber/i, /host(s)?/i], canonical: 'host' },
    { patterns: [/ort/i, /saal/i, /lokal/i, /raum/i, /venue/i], canonical: 'venue' },
    { patterns: [/adresse/i, /standort/i, /wo/i, /straße/i, /str\./i], canonical: 'address' },
    { patterns: [/preis/i, /eintritt/i, /kosten/i, /€\s*\d+/i, /kostenlos/i, /frei/i], canonical: 'price' },
    { patterns: [/uhrzeit/i, /zeit/i, /von/i, /bis/i, /\d{1,2}:\d{2}/], canonical: 'time' },
    { patterns: [/datum/i, /tag/i, /wann/i, /montag|dienstag|mittwoch|donnerstag|freitag|samstag|sonntag/i], canonical: 'date' },
    { patterns: [/abgesagt/i, /verschoben/i, /bestätigt/i, /ausverkauft/i], canonical: 'status' },
    { patterns: [/milonga/i, /practica/i, /kurs/i, /workshop/i, /festival/i], canonical: 'eventType' },
  ],
  fr: [
    { patterns: [/organisateur(s)?/i, /organise(nt)?/i, /présente(nt)?/i, /produit/i], canonical: 'organizer' },
    { patterns: [/dj/i, /musicalisateur/i], canonical: 'dj' },
    { patterns: [/maître(s)?/i, /professeur(s)?/i, /cours (de|avec)/i, /enseignant/i], canonical: 'teacher' },
    { patterns: [/orchestre/i, /musique live/i, /en direct/i, /groupe/i, /quintette/i], canonical: 'orchestra' },
    { patterns: [/spectacle/i, /exhibition/i, /artiste(s)?/i, /danseur(s)?/i], canonical: 'performer' },
    { patterns: [/hôte/i, /host(s)?/i, /accueil/i], canonical: 'host' },
    { patterns: [/lieu/i, /salle/i, /local/i, /espace/i, /venue/i], canonical: 'venue' },
    { patterns: [/adresse/i, /emplacement/i, /où/i, /rue/i, /av\./i, /avenue/i], canonical: 'address' },
    { patterns: [/prix/i, /entrée/i, /coût/i, /€\s*\d+/i, /gratuit/i, /libre/i], canonical: 'price' },
    { patterns: [/heure(s)?/i, /horaire/i, /de/i, /à/i, /\d{1,2}:\d{2}/], canonical: 'time' },
    { patterns: [/date/i, /jour/i, /quand/i, /lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche/i], canonical: 'date' },
    { patterns: [/annulé/i, /reporté/i, /confirmé/i, /complet/i], canonical: 'status' },
    { patterns: [/milonga/i, /practica/i, /cours/i, /atelier/i, /festival/i], canonical: 'eventType' },
  ],
  it: [
    { patterns: [/organizzatore/i, /organizza(no)?/i, /presenta(no)?/i, /produce/i], canonical: 'organizer' },
    { patterns: [/dj/i, /musicalizatore/i], canonical: 'dj' },
    { patterns: [/maestro/i, /professore/i, /lezione (di|con)/i, /insegnante/i], canonical: 'teacher' },
    { patterns: [/orchestra/i, /musica dal vivo/i, /dal vivo/i, /banda/i, /quintetto/i], canonical: 'orchestra' },
    { patterns: [/spettacolo/i, /esibizione/i, /artista/i, /ballerino/i], canonical: 'performer' },
    { patterns: [/ospite/i, /host(s)?/i, /accoglienza/i], canonical: 'host' },
    { patterns: [/luogo/i, /sala/i, /locale/i, /spazio/i, /venue/i], canonical: 'venue' },
    { patterns: [/indirizzo/i, /posizione/i, /dove/i, /via/i, /viale/i], canonical: 'address' },
    { patterns: [/prezzo/i, /ingresso/i, /costo/i, /€\s*\d+/i, /gratuito/i, /libero/i], canonical: 'price' },
    { patterns: [/ora/i, /orario/i, /dalle/i, /alle/i, /\d{1,2}:\d{2}/], canonical: 'time' },
    { patterns: [/data/i, /giorno/i, /quando/i, /lunedì|martedì|mercoledì|giovedì|venerdì|sabato|domenica/i], canonical: 'date' },
    { patterns: [/annullato/i, /rimandato/i, /confermato/i, /esaurito/i], canonical: 'status' },
    { patterns: [/milonga/i, /pratica/i, /lezione/i, /workshop/i, /festival/i], canonical: 'eventType' },
  ],
  en: [
    { patterns: [/organizer(s)?/i, /organized by/i, /presented by/i, /produced by/i, /hosted by/i], canonical: 'organizer' },
    { patterns: [/dj/i, /disc jockey/i, /music by/i, /tanda by/i], canonical: 'dj' },
    { patterns: [/teacher(s)?/i, /maestro(s)?/i, /instructor(s)?/i, /class (with|by)/i, /lesson/i], canonical: 'teacher' },
    { patterns: [/orchestra/i, /live music/i, /live band/i, /band/i, /quintet/i, /quartet/i, /trio/i], canonical: 'orchestra' },
    { patterns: [/show/i, /performance/i, /exhibition/i, /artist(s)?/i, /dancer(s)?/i, /performer(s)?/i], canonical: 'performer' },
    { patterns: [/host(s)?/i, /emcee/i, /mc/i], canonical: 'host' },
    { patterns: [/venue/i, /location/i, /place/i, /hall/i, /studio/i, /space/i], canonical: 'venue' },
    { patterns: [/address/i, /where/i, /street/i, /st\./i, /avenue/i, /ave\./i, /road/i, /rd\./i], canonical: 'address' },
    { patterns: [/price/i, /admission/i, /entry/i, /cost/i, /\$\s*\d+/i, /free/i, /donation/i], canonical: 'price' },
    { patterns: [/time/i, /hours/i, /from/i, /to/i, /\d{1,2}:\d{2}/i, /\d{1,2}\s*(am|pm)/i], canonical: 'time' },
    { patterns: [/date/i, /day/i, /when/i, /monday|tuesday|wednesday|thursday|friday|saturday|sunday/i], canonical: 'date' },
    { patterns: [/cancel(l)?ed/i, /postponed/i, /rescheduled/i, /confirmed/i, /sold out/i], canonical: 'status' },
    { patterns: [/milonga/i, /practica/i, /class/i, /workshop/i, /festival/i, /encuentro/i, /marathon/i], canonical: 'eventType' },
  ],
};

const ROLE_KEYWORDS: { [lang: string]: { [role: string]: string[] } } = {
  es: {
    organizer: ['organiza', 'organizador', 'organizadores', 'presenta', 'produce', 'producción'],
    dj: ['tdj', 'dj', 'musicalizador', 'musicalizadora', 'musicaliza', 'musicalizan', 'musicalización'],
    teacher: ['maestro', 'maestros', 'maestra', 'maestras', 'profesor', 'profesora', 'profesores', 'clase', 'clases', 'enseña'],
    orchestra: ['orquesta', 'música en vivo', 'en vivo', 'live', 'banda', 'quinteto', 'cuarteto', 'trío'],
    performer: ['show', 'exhibición', 'bailan', 'bailarines', 'artista', 'artistas', 'performer'],
    host: ['anfitrión', 'anfitriona', 'recibe', 'host'],
  },
  pt: {
    organizer: ['organiza', 'organizador', 'organizadores', 'apresenta', 'produz', 'produção'],
    dj: ['tdj', 'dj', 'musicalizador', 'musicalizadora'],
    teacher: ['mestre', 'mestres', 'professor', 'professora', 'professores', 'aula', 'aulas'],
    orchestra: ['orquestra', 'música ao vivo', 'ao vivo', 'live', 'banda', 'quinteto'],
    performer: ['show', 'exibição', 'dançam', 'dançarinos', 'artista', 'artistas'],
    host: ['anfitrião', 'anfitriã', 'host'],
  },
  de: {
    organizer: ['veranstalter', 'organisator', 'organisiert'],
    dj: ['dj', 'musikauswahl'],
    teacher: ['lehrer', 'lehrerin', 'maestro', 'unterricht', 'kurs'],
    orchestra: ['orchester', 'live musik', 'livemusik', 'band', 'quintett'],
    performer: ['show', 'aufführung', 'künstler', 'tänzer'],
    host: ['gastgeber', 'host'],
  },
  fr: {
    organizer: ['organisateur', 'organisateurs', 'organise', 'présente', 'produit'],
    dj: ['dj', 'musicalisateur'],
    teacher: ['maître', 'professeur', 'professeurs', 'cours', 'enseignant'],
    orchestra: ['orchestre', 'musique live', 'en direct', 'groupe', 'quintette'],
    performer: ['spectacle', 'exhibition', 'artiste', 'artistes', 'danseur'],
    host: ['hôte', 'accueil', 'host'],
  },
  it: {
    organizer: ['organizzatore', 'organizzatori', 'organizza', 'presenta', 'produce'],
    dj: ['dj', 'musicalizatore'],
    teacher: ['maestro', 'maestri', 'professore', 'lezione', 'insegnante'],
    orchestra: ['orchestra', 'musica dal vivo', 'dal vivo', 'banda', 'quintetto'],
    performer: ['spettacolo', 'esibizione', 'artista', 'artisti', 'ballerino'],
    host: ['ospite', 'accoglienza', 'host'],
  },
  en: {
    organizer: ['organizer', 'organizers', 'organized by', 'presented by', 'produced by', 'hosted by'],
    dj: ['dj', 'disc jockey', 'music by', 'tanda by'],
    teacher: ['teacher', 'teachers', 'maestro', 'maestros', 'instructor', 'class with', 'lesson'],
    orchestra: ['orchestra', 'live music', 'live band', 'band', 'quintet', 'quartet', 'trio'],
    performer: ['show', 'performance', 'exhibition', 'artist', 'artists', 'dancer', 'performer'],
    host: ['host', 'hosts', 'emcee', 'mc'],
  },
};

export interface ExtractedFields {
  organizers: string[];
  djs: string[];
  teachers: string[];
  orchestras: string[];
  performers: string[];
  hosts: string[];
  venue?: string;
  address?: string;
  price?: string;
  time?: string;
  date?: string;
  status?: string;
  coverImage?: string;
  eventType?: string;
}

export class LanguageAwareFieldMapper {
  /**
   * Detect language from HTML content (stateless - returns language, doesn't store)
   */
  detectLanguage(html: string): SupportedLanguage {
    const langAttrMatch = html.match(/<html[^>]*\slang=["']?([a-z]{2})/i);
    if (langAttrMatch) {
      const lang = langAttrMatch[1].toLowerCase();
      if (lang in LANGUAGE_MAPPINGS) {
        return lang as SupportedLanguage;
      }
    }

    const metaLangMatch = html.match(/<meta[^>]*content=["'][^"']*lang(?:uage)?[=:]([a-z]{2})/i);
    if (metaLangMatch) {
      const lang = metaLangMatch[1].toLowerCase();
      if (lang in LANGUAGE_MAPPINGS) {
        return lang as SupportedLanguage;
      }
    }

    const urlMatch = html.match(/hoy-milonga\.com\/[^/]+\/([a-z]{2})\//i);
    if (urlMatch) {
      const lang = urlMatch[1].toLowerCase();
      if (lang in LANGUAGE_MAPPINGS) {
        return lang as SupportedLanguage;
      }
    }

    const scores: { [lang: string]: number } = { es: 0, pt: 0, de: 0, fr: 0, it: 0, en: 0 };
    const text = html.toLowerCase();

    const markers: { [lang: string]: string[] } = {
      es: ['organizador', 'milonga', 'miércoles', 'sábado', 'entrada', 'precio', 'donde', 'cómo llego'],
      pt: ['organizador', 'milonga', 'quarta', 'sábado', 'entrada', 'preço', 'onde', 'como chego'],
      de: ['veranstalter', 'milonga', 'mittwoch', 'samstag', 'eintritt', 'preis', 'wo', 'anfahrt'],
      fr: ['organisateur', 'milonga', 'mercredi', 'samedi', 'entrée', 'prix', 'où', 'comment venir'],
      it: ['organizzatore', 'milonga', 'mercoledì', 'sabato', 'ingresso', 'prezzo', 'dove', 'come arrivare'],
      en: ['organizer', 'milonga', 'wednesday', 'saturday', 'admission', 'price', 'where', 'directions'],
    };

    for (const [lang, words] of Object.entries(markers)) {
      for (const word of words) {
        if (text.includes(word)) {
          scores[lang] += 1;
        }
      }
    }

    let maxLang: SupportedLanguage = 'en';
    let maxScore = 0;
    for (const [lang, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        maxLang = lang as SupportedLanguage;
      }
    }

    return maxLang;
  }

  mapFieldLabel(label: string, language: SupportedLanguage = 'en'): CanonicalField | null {
    const mappings = LANGUAGE_MAPPINGS[language] || LANGUAGE_MAPPINGS.en;
    const normalizedLabel = label.toLowerCase().trim();

    for (const mapping of mappings) {
      for (const pattern of mapping.patterns) {
        if (pattern.test(normalizedLabel)) {
          return mapping.canonical;
        }
      }
    }

    for (const lang of Object.keys(LANGUAGE_MAPPINGS)) {
      if (lang === language) continue;
      const fallbackMappings = LANGUAGE_MAPPINGS[lang];
      for (const mapping of fallbackMappings) {
        for (const pattern of mapping.patterns) {
          if (pattern.test(normalizedLabel)) {
            return mapping.canonical;
          }
        }
      }
    }

    return null;
  }

  /**
   * Multi-language "and" separators for name extraction:
   * - English: "and"
   * - Spanish: "y" 
   * - Portuguese: "e"
   * - Italian: "e"
   * - French: "et"
   * - German: "und"
   */
  extractNamesAfterKeyword(text: string, role: 'organizer' | 'dj' | 'teacher' | 'orchestra' | 'performer' | 'host', language: SupportedLanguage = 'en'): string[] {
    const names: string[] = [];
    const keywords = ROLE_KEYWORDS[language]?.[role] || ROLE_KEYWORDS.en[role] || [];

    // Multi-language "and" pattern: y (ES), e (PT/IT), et (FR), und (DE), and (EN), &
    const andPattern = 'y|e|et|und|and|&';

    for (const keyword of keywords) {
      const pattern = new RegExp(
        `${keyword}[es/as]*[:\\s]+([A-ZÀ-ÿ][\\w'\\-\\.]+(?:\\s+(?:${andPattern}|,)\\s+[A-ZÀ-ÿ][\\w'\\-\\.]+|\\s+[A-ZÀ-ÿ][\\w'\\-\\.]+)*)`,
        'gi'
      );
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        const nameGroup = match[1];
        // Split by all multi-language "and" equivalents: comma, y (ES), e (PT/IT), et (FR), und (DE), and (EN), &
        const splitNames = nameGroup.split(/\s*(?:,|\by\b|\be\b|\bet\b|\bund\b|\band\b|&)\s*/i);
        for (const name of splitNames) {
          const trimmed = name.trim();
          if (trimmed.length > 2 && trimmed.length < 60 && !names.includes(trimmed)) {
            names.push(trimmed);
          }
        }
      }
    }

    return names;
  }

  extractAllRoles(text: string, language: SupportedLanguage = 'en'): ExtractedFields {
    return {
      organizers: this.extractNamesAfterKeyword(text, 'organizer', language),
      djs: this.extractNamesAfterKeyword(text, 'dj', language),
      teachers: this.extractNamesAfterKeyword(text, 'teacher', language),
      orchestras: this.extractNamesAfterKeyword(text, 'orchestra', language),
      performers: this.extractNamesAfterKeyword(text, 'performer', language),
      hosts: this.extractNamesAfterKeyword(text, 'host', language),
    };
  }

  extractPrice(text: string): string | undefined {
    const patterns = [
      /(?:precio|entrada|costo|valor|price|admission|entry|preço|preis|eintritt|prix|entrée|prezzo|ingresso)[:\s]*([^\n<]+)/i,
      /(\$\s*\d+(?:[.,]\d{2})?)/,
      /(€\s*\d+(?:[.,]\d{2})?)/,
      /(R\$\s*\d+(?:[.,]\d{2})?)/,
      /(\d+\s*(?:pesos|euros|dollars|reais))/i,
      /(gratis|gratuito|free|kostenlos|gratuit|libero)/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1]?.trim() || match[0]?.trim();
      }
    }
    return undefined;
  }

  extractStatus(text: string): string | undefined {
    const statusPatterns = [
      { pattern: /cancelado|cancelled|canceled|annulé|abgesagt|annullato/i, status: 'cancelled' },
      { pattern: /suspendido|suspended|suspendu|ausgesetzt|sospeso/i, status: 'suspended' },
      { pattern: /reprogramado|rescheduled|reporté|verschoben|rimandato/i, status: 'rescheduled' },
      { pattern: /confirmado|confirmed|confirmé|bestätigt|confermato/i, status: 'confirmed' },
      { pattern: /agotado|sold out|complet|ausverkauft|esaurito|esgotado/i, status: 'sold_out' },
    ];

    for (const { pattern, status } of statusPatterns) {
      if (pattern.test(text)) {
        return status;
      }
    }
    return undefined;
  }
}

export const languageAwareFieldMapper = new LanguageAwareFieldMapper();
