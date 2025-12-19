/**
 * Legal Document Management Test Fixtures
 * Provides test data for documents, templates, clauses, signatures
 */

export const testDocument = {
  title: 'Tango Workshop Participant Waiver',
  content: `PARTICIPANT WAIVER AND RELEASE OF LIABILITY

This Waiver and Release of Liability ("Waiver") is entered into by and between {{participant_name}} ("Participant") and {{event_organizer}} ("Organizer").

1. ACKNOWLEDGMENT OF RISKS
Participant acknowledges that tango dancing involves inherent risks including but not limited to physical injury, strain, and potential collision with other participants.

2. VOLUNTARY PARTICIPATION
Participant voluntarily chooses to participate in {{event_name}} scheduled for {{event_date}} at {{event_location}}.

3. ASSUMPTION OF RISK
Participant assumes all risks associated with participation, including risks that may arise from negligence or carelessness of others.

4. RELEASE OF LIABILITY
Participant hereby releases, waives, and discharges Organizer, its officers, employees, and agents from any and all liability for injury, death, or property damage arising from participation.

5. MEDICAL TREATMENT
Participant authorizes Organizer to obtain emergency medical treatment if necessary.

6. GOVERNING LAW
This Waiver shall be governed by the laws of {{jurisdiction}}.

By signing below, Participant acknowledges having read and understood this Waiver.

Participant Signature: ____________________
Date: {{signature_date}}

Organizer Representative: ____________________
Date: {{organizer_signature_date}}`
};

export const testCustomDocument = {
  title: 'Dance Studio Rental Agreement',
  content: 'This agreement is made between the Studio Owner and the Renter for the rental of dance studio space.'
};

export const testTemplateVariables = {
  participant_name: 'John Smith',
  event_organizer: 'Mundo Tango Dance Studio',
  event_name: 'Advanced Tango Workshop',
  event_date: '2025-06-15',
  event_location: '123 Tango Street, Buenos Aires',
  jurisdiction: 'State of California',
  signature_date: '2025-05-20',
  organizer_signature_date: '2025-05-20'
};

export const testClauses = [
  {
    type: 'liability',
    content: 'The Organizer shall not be liable for any injuries sustained during the event.'
  },
  {
    type: 'termination',
    content: 'Either party may terminate this agreement with 30 days written notice.'
  },
  {
    type: 'dispute-resolution',
    content: 'Any disputes shall be resolved through binding arbitration in accordance with AAA rules.'
  },
  {
    type: 'confidentiality',
    content: 'Both parties agree to keep confidential any proprietary information shared during the term of this agreement.'
  }
];

export const testSignatureRequest = {
  recipients: ['participant@example.com', 'organizer@example.com'],
  workflow: 'sequential' as const,
  instructions: 'Please review and sign this waiver before attending the workshop.'
};

export const parallelSignatureRequest = {
  recipients: ['signer1@example.com', 'signer2@example.com', 'signer3@example.com'],
  workflow: 'parallel' as const,
  instructions: 'All parties must sign within 7 days.'
};

export const sampleDocuments = [
  {
    id: 1,
    userId: 1,
    title: 'Event Liability Waiver',
    category: 'waiver',
    status: 'published',
    createdAt: '2025-05-01',
    signaturesRequired: 1,
    signaturesPending: 0,
    signaturesCompleted: 1
  },
  {
    id: 2,
    userId: 1,
    title: 'Dance Instructor Contract',
    category: 'contract',
    status: 'draft',
    createdAt: '2025-05-10',
    signaturesRequired: 2,
    signaturesPending: 2,
    signaturesCompleted: 0
  },
  {
    id: 3,
    userId: 1,
    title: 'Studio Rental Agreement',
    category: 'agreement',
    status: 'published',
    createdAt: '2025-04-20',
    signaturesRequired: 2,
    signaturesPending: 1,
    signaturesCompleted: 1
  },
  {
    id: 4,
    userId: 1,
    title: 'Photo/Video Release Form',
    category: 'release',
    status: 'published',
    createdAt: '2025-05-15',
    signaturesRequired: 1,
    signaturesPending: 0,
    signaturesCompleted: 1
  }
];

export const sampleTemplates = [
  {
    id: 1,
    name: 'Event Liability Waiver',
    category: 'waiver',
    description: 'Standard waiver for tango events and workshops',
    variables: ['participant_name', 'event_name', 'event_date', 'event_location']
  },
  {
    id: 2,
    name: 'Instructor Service Agreement',
    category: 'contract',
    description: 'Contract for hiring tango instructors',
    variables: ['instructor_name', 'hourly_rate', 'start_date', 'duration']
  },
  {
    id: 3,
    name: 'Studio Rental Agreement',
    category: 'agreement',
    description: 'Agreement for renting dance studio space',
    variables: ['renter_name', 'studio_address', 'rental_rate', 'rental_period']
  },
  {
    id: 4,
    name: 'Photo/Video Release',
    category: 'release',
    description: 'Permission to use photos/videos from events',
    variables: ['participant_name', 'event_name', 'usage_terms']
  },
  {
    id: 5,
    name: 'Partnership Agreement',
    category: 'agreement',
    description: 'Agreement between business partners',
    variables: ['partner1_name', 'partner2_name', 'business_name', 'ownership_split']
  },
  {
    id: 6,
    name: 'Vendor Contract',
    category: 'contract',
    description: 'Contract with vendors and suppliers',
    variables: ['vendor_name', 'services_provided', 'payment_terms']
  },
  {
    id: 7,
    name: 'NDA (Non-Disclosure Agreement)',
    category: 'agreement',
    description: 'Confidentiality agreement for sensitive information',
    variables: ['disclosing_party', 'receiving_party', 'effective_date']
  }
];

export const aiReviewResults = {
  clauseExtraction: {
    liability: 'Found: Release of Liability clause',
    termination: 'Missing: No termination clause found',
    disputeResolution: 'Found: Arbitration clause',
    confidentiality: 'Not Applicable',
    payment: 'Not Applicable',
    indemnification: 'Missing: No indemnification clause'
  },
  completenessCheck: {
    score: 75,
    missingClauses: ['termination', 'indemnification'],
    recommendations: [
      'Add clear termination conditions',
      'Include mutual indemnification provisions',
      'Consider adding force majeure clause'
    ]
  },
  riskAssessment: {
    score: 68,
    risks: [
      {
        level: 'medium',
        description: 'Broad liability release may not be enforceable in all jurisdictions'
      },
      {
        level: 'low',
        description: 'Missing emergency contact information'
      }
    ]
  },
  complianceCheck: {
    ESIGN_ACT: 'Compliant',
    UETA: 'Compliant',
    GDPR: 'Not Applicable',
    CCPA: 'Compliant'
  },
  plainLanguageSuggestions: [
    'Replace "hereby" with simpler language',
    'Break long sentences into shorter ones',
    'Define technical terms in glossary'
  ],
  inconsistencies: [
    'Party names inconsistently capitalized',
    'Date format varies throughout document'
  ]
};

export const aiAssistantRecommendations = {
  clauseRecommendations: [
    {
      type: 'termination',
      content: 'Either party may terminate this agreement with 30 days written notice.',
      reason: 'Provides clear exit path for both parties'
    },
    {
      type: 'force-majeure',
      content: 'Neither party shall be liable for failure to perform due to circumstances beyond their control.',
      reason: 'Protects both parties in unexpected situations'
    }
  ],
  jurisdictionGuidance: {
    state: 'California',
    requirements: [
      'California law requires specific language for liability waivers',
      'Minor participants need parental/guardian signature',
      'Consider adding severability clause'
    ]
  },
  industryBestPractices: [
    'Include witness signatures for high-value agreements',
    'Specify insurance coverage requirements',
    'Add photo identification verification'
  ],
  negotiationSuggestions: [
    'Consider mutual liability cap',
    'Add dispute resolution timeline',
    'Include amendment procedures'
  ]
};

export const documentComparisonResults = {
  differences: [
    {
      section: 'Liability Clause',
      document1: 'Broad release of all liability',
      document2: 'Limited release with exceptions'
    },
    {
      section: 'Dispute Resolution',
      document1: 'Arbitration required',
      document2: 'Mediation then litigation'
    }
  ],
  strengths: {
    document1: ['Clear language', 'Comprehensive coverage', 'Easy to understand'],
    document2: ['More balanced terms', 'Better protection for participants', 'Detailed procedures']
  },
  weaknesses: {
    document1: ['Too broad', 'May not be enforceable', 'Missing key clauses'],
    document2: ['Complex language', 'Lengthy', 'Requires legal expertise']
  },
  bestPractices: [
    'Combine clear language from Document 1 with balanced terms from Document 2',
    'Add missing clauses from both documents',
    'Simplify dispute resolution process'
  ]
};
