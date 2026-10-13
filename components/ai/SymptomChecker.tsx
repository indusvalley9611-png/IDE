'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  MessageCircle,
  Send,
  Bot,
  User,
  AlertTriangle,
  Heart,
  Activity,
  X,
  ShieldAlert,
  CheckCircle2,
  Phone,
  Building2,
  Clock,
  Sparkles,
  RefreshCw,
  ChevronRight,
  Stethoscope,
  Info,
} from 'lucide-react';

// ============================================================================
// TYPES & CLINICAL INTERFACES
// ============================================================================

export type TriagePriority = 'RED' | 'YELLOW' | 'GREEN';

export interface TriageResult {
  id: string;
  condition: string;
  marathiCondition: string;
  priority: TriagePriority;
  priorityLabel: string;
  facilityType: string;
  timeframe: string;
  summary: string;
  matchedSymptoms: string[];
  keyInstructions: string[];
  warningSigns: string[];
  emergencyHelpline?: string;
  facilityBadgeColor?: string;
}

export interface FollowUpOption {
  label: string;
  query: string;
  category?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  triage?: TriageResult;
  followUpOptions?: FollowUpOption[];
}

export interface SymptomCheckerProps {
  onClose: () => void;
  onTriageComplete?: (triage: TriageResult) => void;
}

// ============================================================================
// LOCAL RULE-BASED CLINICAL KNOWLEDGE BASE (OFFLINE SAFE)
// ============================================================================

interface ConditionDefinition {
  id: string;
  condition: string;
  marathiCondition: string;
  priority: TriagePriority;
  priorityLabel: string;
  facilityType: string;
  timeframe: string;
  summary: string;
  keyInstructions: string[];
  warningSigns: string[];
  emergencyHelpline?: string;
}

const CLINICAL_CONDITIONS: Record<string, ConditionDefinition> = {
  // 1. CARDIAC EMERGENCY (RED)
  cardiac_emergency: {
    id: 'cardiac_emergency',
    condition: 'Suspected Cardiac Emergency (Acute Coronary Syndrome)',
    marathiCondition: 'संभाव्य हृदयविकाराचा झटका / आपत्कालीन कार्डियाक स्थिती',
    priority: 'RED',
    priorityLabel: 'EMERGENCY — RED (IMMEDIATE ACTION)',
    facilityType: 'District Hospital / Tertiary Cardiac Care Centre with ICU & Cath Lab',
    timeframe: 'Immediate (Golden Hour — 0 to 60 minutes)',
    summary:
      'Severe chest discomfort, tightness, or pain coupled with breathlessness strongly indicates potential myocardial ischemia or acute coronary event requiring immediate emergency stabilization.',
    emergencyHelpline: '108 / 112 (National Emergency Ambulance)',
    keyInstructions: [
      'Call 108 Emergency Ambulance immediately — do not drive yourself.',
      'Sit down in a comfortable half-sitting position with knees bent and back supported.',
      'Loosen tight neckwear, collars, and waistbands to assist breathing.',
      'Chew soluble Aspirin (300mg) if available, medically advised, and no allergy/bleeding disorder.',
      'Avoid any physical exertion, walking, climbing stairs, or eating/drinking.',
    ],
    warningSigns: [
      'Pain radiating to left arm, neck, jaw, back, or epigastrium',
      'Cold profuse sweating (diaphoresis)',
      'Sudden dizziness, fainting (syncope), or confusion',
      'Bluish discoloration of lips, nails, or skin (cyanosis)',
    ],
  },

  // 2. OBSTETRIC EMERGENCY (RED)
  obstetric_emergency: {
    id: 'obstetric_emergency',
    condition: 'Obstetric Emergency (Pregnancy Complication / Bleeding / Severe Pain)',
    marathiCondition: 'गर्भावस्थेतील तातडीची आपत्कालीन गुंतागुंत (रक्तस्त्राव / तीव्र वेदना)',
    priority: 'RED',
    priorityLabel: 'EMERGENCY — RED (IMMEDIATE ACTION)',
    facilityType: 'First Referral Unit (FRU) / Sub-District or District Hospital with C-Section & Blood Bank',
    timeframe: 'Immediate Transfer (< 30 minutes)',
    summary:
      'Vaginal bleeding or acute severe abdominal/pelvic pain during pregnancy presents a life-threatening risk for both mother and fetus (ectopic pregnancy, placental abruption, or uterine rupture).',
    emergencyHelpline: '108 (Janani Shishu Suraksha Karyakram - JSSK)',
    keyInstructions: [
      'Call 108 JSSK maternal ambulance immediately for expedited hospital transfer.',
      'Lie down strictly on your left side (left lateral position) to maximize placental blood flow.',
      'Keep sanitary pads to quantify blood loss for the obstetrician — do not insert tampons.',
      'Do not consume food or water in case emergency surgical or obstetric intervention is required.',
      'Notify your village ASHA worker or nearest ANM immediately.',
    ],
    warningSigns: [
      'Heavy bleeding soaking through multiple pads or passing large clots',
      'Sudden gush of fluid or watery vaginal discharge',
      'Severe unremitting lower abdominal or shoulder-tip pain',
      'Dizziness, pallor, cold extremities, or maternal fainting',
      'Absence or sharp decrease in fetal kicks/movements',
    ],
  },

  // 3. PRE-ECLAMPSIA / GESTATIONAL HYPERTENSION CRISIS (RED)
  preeclampsia: {
    id: 'preeclampsia',
    condition: 'Pre-eclampsia / Gestational Hypertensive Crisis',
    marathiCondition: 'प्री-एक्लॅम्पसिया / गरोदरपणातील गंभीर उच्च रक्तदाब',
    priority: 'RED',
    priorityLabel: 'EMERGENCY — RED (IMMEDIATE ACTION)',
    facilityType: 'District Hospital / High-Risk Obstetric Centre with Maternal & Neonatal ICU',
    timeframe: 'Immediate Evaluation (< 1-2 hours)',
    summary:
      'High blood pressure during pregnancy paired with severe headache, visual disturbances, or sudden swelling indicates pre-eclampsia, which can rapidly progress to eclamptic seizures.',
    emergencyHelpline: '108 (Maternal Emergency) / 104',
    keyInstructions: [
      'Arrange immediate transfer to a District Hospital or FRU equipped with Magnesium Sulphate.',
      'Rest in a quiet, darkened room on your left lateral side to prevent seizure triggers.',
      'Do not take over-the-counter pain relievers without obstetric consultation.',
      'Carry maternal ANC green card/RCH card and all previous antenatal records.',
      'Prepare for urgent blood pressure titration and urine protein assessment.',
    ],
    warningSigns: [
      'Severe throbbing frontal headache unresponsive to paracetamol',
      'Visual blurring, flashing lights, or temporary loss of vision',
      'Severe pain in the upper right abdomen beneath the ribs (epigastric/liver pain)',
      'Sudden swelling of face, hands, and eyelids (anasarca)',
      'Twitching, involuntary jerking movements, or seizures',
    ],
  },

  // 4. HYPERTENSIVE CRISIS (RED)
  hypertensive_crisis: {
    id: 'hypertensive_crisis',
    condition: 'Hypertensive Crisis / Urgent High BP with Target Organ Signs',
    marathiCondition: 'उच्च रक्तदाब आणीबाणी / तात्काळ वैद्यकीय हस्तक्षेप आवश्यक',
    priority: 'RED',
    priorityLabel: 'EMERGENCY — RED (IMMEDIATE ACTION)',
    facilityType: 'District Hospital Emergency / Sub-District Hospital Casualty Ward',
    timeframe: 'Immediate Emergency Care (< 1 hour)',
    summary:
      'High blood pressure combined with neurological symptoms (severe headache, dizziness, blurry vision) signals impending hypertensive encephalopathy, stroke, or cardiovascular strain.',
    emergencyHelpline: '108 / 112',
    keyInstructions: [
      'Seek emergency room evaluation immediately to safely lower blood pressure.',
      'Sit comfortably in an upright position; do not lie completely flat or make sudden movements.',
      'Avoid panic, exertion, caffeine, and tobacco, which drive arterial pressures higher.',
      'Do not self-administer double-doses of oral BP medications without physician oversight.',
      'Bring all ongoing antihypertensive medication strips to the emergency room.',
    ],
    warningSigns: [
      'Slurred speech, facial asymmetry, or weakness/numbness on one side of the body',
      'Sudden severe unremitting headache ("worst headache of life")',
      'Confusion, disorientation, or altered consciousness',
      'Chest tightness or acute shortness of breath',
    ],
  },

  // 5. DENGUE / MALARIA SUSPICION (YELLOW)
  dengue_malaria: {
    id: 'dengue_malaria',
    condition: 'Dengue / Malaria Suspicion (Vector-Borne Febrile Illness)',
    marathiCondition: 'डेंग्यू किंवा मलेरियाची दाट शक्यता (कीटकजन्य ताप)',
    priority: 'YELLOW',
    priorityLabel: 'URGENT — YELLOW (WITHIN 12-24 HOURS)',
    facilityType: 'Community Health Centre (CHC) or Primary Health Centre (PHC) with Diagnostic Lab',
    timeframe: 'Within 12 to 24 Hours',
    summary:
      'Fever accompanied by intense headache and generalized body aches is characteristic of vector-borne tropical infections (Dengue, Malaria, or Chikungunya), requiring laboratory blood testing.',
    emergencyHelpline: '104 (Maharashtra Health Tele-Consult)',
    keyInstructions: [
      'Visit nearest PHC/CHC for Complete Blood Count (CBC/Platelet test) and Malaria RDT / Dengue NS1 antigen.',
      'Hydrate aggressively with Oral Rehydration Salts (ORS), coconut water, lemon water, and thin soups.',
      'Take Paracetamol for fever management (do NOT exceed 4g/day in adults).',
      'CRITICAL: Strictly AVOID Aspirin, Ibuprofen, Diclofenac, or other NSAIDs due to severe platelet bleeding risks.',
      'Rest under an insecticide-treated bed net to prevent secondary mosquito transmission.',
    ],
    warningSigns: [
      'Bleeding manifestations (bleeding gums, epistaxis/nosebleed, black tarry stools)',
      'Persistent severe abdominal pain or persistent vomiting (>3 episodes)',
      'Sudden drop in body temperature accompanied by cold, clammy extremities (Dengue Shock)',
      'Extreme lethargy, confusion, or restlessness',
    ],
  },

  // 6. ACUTE RESPIRATORY INFECTION (YELLOW)
  respiratory_infection: {
    id: 'respiratory_infection',
    condition: 'Acute Respiratory Infection (Suspected Pneumonia / Severe Bronchitis)',
    marathiCondition: 'तीव्र श्वसन संसर्ग / संभाव्य न्यूमोनिया किंवा ब्रॉन्कायटिस',
    priority: 'YELLOW',
    priorityLabel: 'URGENT — YELLOW (WITHIN 6-12 HOURS)',
    facilityType: 'Community Health Centre (CHC) or Sub-District Hospital (with Chest X-ray & Oxygen Beds)',
    timeframe: 'Within 6 to 12 Hours',
    summary:
      'The triad of cough, fever, and shortness of breath points to lower respiratory tract involvement, which requires chest auscultation, pulse oximetry, and potential antibiotic/bronchodilator therapy.',
    emergencyHelpline: '104 / 108 (if SpO2 < 92%)',
    keyInstructions: [
      'Seek clinical examination for chest auscultation and SpO2 pulse oximetry assessment.',
      'Monitor blood oxygen saturation (SpO2); if it drops below 94%, report to an emergency unit.',
      'Drink warm water, take steam inhalation twice daily, and practice gentle deep breathing.',
      'Rest in a propped-up upright posture (at 45 degrees) to ease lung expansion.',
      'Complete full prescribed antibiotic/antiviral courses under medical supervision.',
    ],
    warningSigns: [
      'Pulse oximeter reading SpO2 consistently under 94% on room air',
      'Rapid breathing (tachypnea) or chest indrawing/retractions while inhaling',
      'Inability to speak full sentences in one breath',
      'Bluish tint on fingernails or lips; hemoptysis (coughing up blood)',
    ],
  },

  // 7. ACUTE GASTROENTERITIS (YELLOW)
  acute_gastroenteritis: {
    id: 'acute_gastroenteritis',
    condition: 'Acute Gastroenteritis / Dehydration Risk',
    marathiCondition: 'तीव्र गॅस्ट्रोएन्टेरिटिस / जुलाब-उलट्या व डिहायड्रेशन',
    priority: 'YELLOW',
    priorityLabel: 'URGENT — YELLOW (WITHIN 4-8 HOURS)',
    facilityType: 'Primary Health Centre (PHC) / Community Health Centre (CHC)',
    timeframe: 'Same Day (Within 4 to 8 Hours)',
    summary:
      'Concurrent watery diarrhea and vomiting poses a rapid dehydration and electrolyte depletion hazard, especially in young children, elderly patients, or tropical climate conditions.',
    emergencyHelpline: '104 / 108 (if unarousable or shock)',
    keyInstructions: [
      'Begin WHO-standard Oral Rehydration Salts (ORS) solution immediately: 1 packet in 1 litre clean water.',
      'Drink small, frequent sips of ORS after every single loose motion episode.',
      'Include zinc supplementation (20mg daily for adults) and tender coconut water or rice kanji.',
      'Maintain easily digestible, bland diet (khichdi, curd rice, boiled potatoes, bananas).',
      'Visit PHC for IV rehydration (Ringer Lactate) if unable to retain any oral fluids.',
    ],
    warningSigns: [
      'Inability to retain liquids or persistent vomiting lasting > 6 hours',
      'Marked signs of severe dehydration: sunken eyes, dry tongue/mucosa, no urine passed in > 8 hours',
      'Blood or mucous present in stools (dysentery)',
      'High-grade fever (> 102°F / 38.9°C) with abdominal rigidity',
    ],
  },

  // 8. COMMON COLD / MILD URTI (GREEN)
  common_cold: {
    id: 'common_cold',
    condition: 'Common Cold / Mild Upper Respiratory Viral Infection',
    marathiCondition: 'सामान्य सर्दी, पडसे व सौम्य विषाणूजन्य संसर्ग',
    priority: 'GREEN',
    priorityLabel: 'ROUTINE — GREEN (STANDARD OPD VISIT)',
    facilityType: 'Primary Health Centre (PHC) / Ayushman Arogya Mandir (Sub-Centre) / Teleconsult',
    timeframe: 'Routine Outpatient (if persisting > 4-5 days)',
    summary:
      'Mild fever with runny nose, sneezing, and sore throat is consistent with self-limiting viral upper respiratory infection that typically resolves with symptomatic home care and rest.',
    emergencyHelpline: '104 (Free Medical Teleconsultation)',
    keyInstructions: [
      'Get ample restful sleep and drink warm fluids (warm water, herbal decoctions, tulsi-ginger tea).',
      'Perform steam inhalation for 5-10 minutes twice daily to relieve sinus congestion.',
      'Gargle with warm saline water (1/2 tsp salt in warm water) 3 times a day for throat soothing.',
      'Take Paracetamol (500mg or 650mg) only if fever or body fatigue causes discomfort.',
      'Practice cough hygiene (cover mouth, wash hands) to avoid spreading to household members.',
    ],
    warningSigns: [
      'Fever persisting unabated beyond 3 to 4 days or spiking above 102°F',
      'Development of shortness of breath, wheezing, or chest tightness',
      'Severe ear pain or purulent nasal drainage lasting over 10 days',
      'Inability to swallow liquids or painful neck swelling',
    ],
  },

  // 9. ALLERGIC DERMATITIS (GREEN)
  dermatitis: {
    id: 'dermatitis',
    condition: 'Allergic Dermatitis / Pruritic Skin Rash',
    marathiCondition: 'त्वचारोग, खाज व अलर्जिक डर्मेटायटिस',
    priority: 'GREEN',
    priorityLabel: 'ROUTINE — GREEN (STANDARD OPD VISIT)',
    facilityType: 'Primary Health Centre (PHC) / Ayushman Arogya Mandir / Dermatology OPD',
    timeframe: 'Routine Outpatient Visit',
    summary:
      'Skin eruption characterized by rashes and pruritus (itching) is commonly caused by contact dermatitis, eczema, insect bites, or seasonal allergic responses.',
    emergencyHelpline: '104',
    keyInstructions: [
      'Visit nearest PHC or Ayushman Arogya Mandir for examination and prescription antihistamines/creams.',
      'Apply soothing Calamine lotion or cool, damp compresses to alleviate intense itching.',
      'Do NOT scratch or rub vigorously, as breaking the skin introduces secondary bacterial infections.',
      'Wear loose, breathable cotton clothing and avoid harsh scented soaps, chemicals, or detergents.',
      'Identify and discontinue recent new personal products, cosmetics, laundry agents, or plant exposures.',
    ],
    warningSigns: [
      'Sudden swelling of lips, tongue, eyelids, or difficulty breathing (Anaphylaxis — CALL 108 IMMEDIATELY)',
      'Rapidly spreading rash with fever, skin peeling, or large fluid-filled blisters',
      'Yellow crusting, pus discharge, or increasing warmth and tender red streaks around the rash',
    ],
  },

  // 10. ARTHRITIS / JOINT INFLAMMATION (GREEN)
  arthritis: {
    id: 'arthritis',
    condition: 'Arthritis / Musculoskeletal Joint Inflammation',
    marathiCondition: 'सांधेदुखी व सांध्यांची सूज (आमवात / संधिवात)',
    priority: 'GREEN',
    priorityLabel: 'ROUTINE — GREEN (STANDARD OPD VISIT)',
    facilityType: 'Primary Health Centre (PHC) / Community Health Centre (CHC) Orthopedic OPD',
    timeframe: 'Routine Outpatient Consultation',
    summary:
      'Pain accompanied by joint swelling and stiffness is typical of osteoarthritis, rheumatoid flare, or mechanical strain, best evaluated in a routine outpatient clinical setting.',
    emergencyHelpline: '104',
    keyInstructions: [
      'Visit PHC or CHC orthopedic OPD for clinical evaluation, joint mobility check, and potential X-rays.',
      'Rest the affected joint and avoid heavy weight-bearing or strenuous repetitive motions.',
      'Apply cold ice packs (wrapped in cloth) for 15 mins for acute swelling, or warm packs for chronic morning stiffness.',
      'Perform gentle non-impact range-of-motion stretching exercises to prevent joint contractures.',
      'Maintain healthy hydration and inquire with doctor about safe topical pain relief gels.',
    ],
    warningSigns: [
      'Single joint that is acutely red, hot to touch, severely swollen, and accompanied by fever (Septic Arthritis — URGENT)',
      'Sudden total inability to bear any weight or severe deformity following a fall or trauma',
      'Associated numbness, pins-and-needles, or weakness in feet, fingers, or lower limbs',
    ],
  },
};

// ============================================================================
// KEYWORD & NLP DETECTION ENGINE
// ============================================================================

interface SymptomTags {
  fever: boolean;
  mildFever: boolean;
  headache: boolean;
  bodyAche: boolean;
  chestPain: boolean;
  breathlessness: boolean;
  highBp: boolean;
  dizziness: boolean;
  blurredVision: boolean;
  pregnancy: boolean;
  bleeding: boolean;
  severePain: boolean;
  cough: boolean;
  diarrhea: boolean;
  vomiting: boolean;
  dehydration: boolean;
  cold: boolean;
  skinRash: boolean;
  itching: boolean;
  jointPain: boolean;
  swelling: boolean;
}

function normalizeInput(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^\w\s+]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function detectKeywords(normalized: string): SymptomTags {
  const containsAny = (...phrases: string[]) => {
    return phrases.some((phrase) => {
      // Check full word / phrase boundary
      const clean = phrase.toLowerCase();
      if (normalized.includes(clean)) return true;
      return false;
    });
  };

  const mildFever = containsAny('mild fever', 'low grade fever', 'slight fever', 'light fever', 'mild temperature', 'thoda tap');
  const fever = mildFever || containsAny('fever', 'temperature', 'taap', 'tap', 'bukhar', 'pyrexia', 'chills', 'shivering', 'feverish', 'hot body');
  
  const headache = containsAny('headache', 'head ache', 'head pain', 'migraine', 'throbbing head', 'sir dard', 'dokhe dukhi', 'doke dukhi', 'sir ghumna');
  const bodyAche = containsAny('body ache', 'body pain', 'bodyache', 'muscle pain', 'myalgia', 'body pains', 'badan dard', 'ang dukhi', 'fatigue', 'weakness', 'bodyache');
  
  const chestPain = containsAny('chest pain', 'pain in chest', 'chest pressure', 'chest tightness', 'heart pain', 'angina', 'heavy chest', 'chest discomfort', 'left chest pain', 'tightness in chest', 'chhati dukhi', 'chhati dard', 'cardiac');
  const breathlessness = containsAny('breathless', 'breathlessness', 'short of breath', 'shortness of breath', 'difficulty breathing', 'hard to breathe', 'trouble breathing', 'dyspnea', 'gasping', 'wheezing', 'breathing problem', 'breathing difficulty', 'suffocation', 'cant breathe', "can't breathe", 'dam lagne', 'saans');
  
  const highBp = containsAny('high bp', 'high blood pressure', 'bp high', 'hypertension', 'elevated bp', 'blood pressure high', 'raktdab');
  const dizziness = containsAny('dizziness', 'dizzy', 'giddiness', 'giddy', 'lightheaded', 'lightheadedness', 'spinning', 'spinning head', 'vertigo', 'chakkar', 'bhram');
  const blurredVision = containsAny('blurred vision', 'blurry vision', 'vision blur', 'dim vision', 'diminished vision', 'seeing spots', 'visual disturbance', 'loss of vision', 'haziness', 'dhundla');
  
  const pregnancy = containsAny('pregnant', 'pregnancy', 'expecting', 'trimester', 'garbhvati', 'garbhavastha', 'womb', 'foetus', 'fetus', 'carrying child', 'gestation', 'maternal', 'anc');
  const bleeding = containsAny('bleeding', 'bleed', 'blood', 'spotting', 'discharge blood', 'hemorrhage', 'per vaginal bleed', 'vaginal bleeding', 'blood flow', 'raktstrav', 'khoon');
  const severePain = containsAny('severe pain', 'extreme pain', 'acute pain', 'sharp pain', 'pelvic pain', 'cramping', 'intense pain', 'severe abdominal pain', 'stomach cramps', 'severe cramps', 'sharp abdominal', 'pottat dukhi');
  
  const cough = containsAny('cough', 'coughing', 'khansi', 'khokla', 'phlegm', 'sputum', 'wet cough', 'dry cough');
  const diarrhea = containsAny('diarrhea', 'diarrhoea', 'loose motion', 'loose motions', 'watery stool', 'dast', 'frequent stool', 'runny motion', 'julab', 'haga');
  const vomiting = containsAny('vomit', 'vomiting', 'throwing up', 'nausea', 'vomited', 'ulti', 'puke', 'retching');
  const dehydration = containsAny('dehydration', 'dehydrated', 'dry mouth', 'excessive thirst', 'extreme thirst', 'sunken eyes', 'no urine', 'low urine', 'tahan', 'pani kami');
  
  const cold = containsAny('cold', 'runny nose', 'sneezing', 'sore throat', 'nasal congestion', 'stuffy nose', 'rhinitis', 'flu', 'sardi', 'khokla', 'shinke');
  const skinRash = containsAny('skin rash', 'rash', 'rashes', 'red spots', 'hives', 'urticaria', 'skin eruption', 'blotches', 'red bumps', 'skin allergy', 'tvacha', 'pitt');
  const itching = containsAny('itching', 'itchy', 'itch', 'khujli', 'scratching', 'pruritus', 'irritation', 'khandaj');
  
  const jointPain = containsAny('joint pain', 'joint ache', 'knee pain', 'knees hurt', 'joints hurt', 'arthralgia', 'knee ache', 'ankle pain', 'elbow pain', 'hip pain', 'sandhivat', 'sandhe dukhi');
  const swelling = containsAny('swelling', 'swollen', 'inflamed joint', 'puffy', 'edema', 'oedema', 'sujan', 'sooj');

  return {
    fever,
    mildFever,
    headache,
    bodyAche,
    chestPain,
    breathlessness,
    highBp,
    dizziness,
    blurredVision,
    pregnancy,
    bleeding,
    severePain,
    cough,
    diarrhea,
    vomiting,
    dehydration,
    cold,
    skinRash,
    itching,
    jointPain,
    swelling,
  };
}

/**
 * Clinical Evaluation Engine — Rule based matching against the 10 core conditions
 */
function evaluateTriageEngine(userInput: string): TriageResult | null {
  const norm = normalizeInput(userInput);
  const tags = detectKeywords(norm);

  // ──────────────────────────────────────────────────────────────────────────
  // RULE 1: PREGNANCY + BLEEDING / SEVERE PAIN → OBSTETRIC EMERGENCY (RED)
  // ──────────────────────────────────────────────────────────────────────────
  if (tags.pregnancy && (tags.bleeding || tags.severePain)) {
    const matched: string[] = ['Pregnancy'];
    if (tags.bleeding) matched.push('Vaginal Bleeding / Spotting');
    if (tags.severePain) matched.push('Severe Abdominal / Pelvic Pain');

    return {
      ...CLINICAL_CONDITIONS.obstetric_emergency,
      matchedSymptoms: matched,
    };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // RULE 2: PREGNANCY + HIGH BP / PRE-ECLAMPSIA SIGNS → PRE-ECLAMPSIA (RED)
  // ──────────────────────────────────────────────────────────────────────────
  if (
    tags.pregnancy &&
    (tags.highBp || (tags.headache && tags.swelling) || (tags.headache && tags.blurredVision))
  ) {
    const matched: string[] = ['Pregnancy'];
    if (tags.highBp) matched.push('High Blood Pressure');
    if (tags.headache) matched.push('Persistent Headache');
    if (tags.blurredVision) matched.push('Visual Disturbances');
    if (tags.swelling) matched.push('Facial / Limb Swelling');

    return {
      ...CLINICAL_CONDITIONS.preeclampsia,
      matchedSymptoms: matched,
    };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // RULE 3: CHEST PAIN + BREATHLESSNESS → CARDIAC EMERGENCY (RED)
  // ──────────────────────────────────────────────────────────────────────────
  if (tags.chestPain && tags.breathlessness) {
    return {
      ...CLINICAL_CONDITIONS.cardiac_emergency,
      matchedSymptoms: ['Chest Pain / Discomfort', 'Shortness of Breath / Breathlessness'],
    };
  }

  // Also catch isolated severe chest pain if explicitly stated or selected
  if (tags.chestPain && norm.includes('cardiac') || (tags.chestPain && norm.includes('emergency'))) {
    return {
      ...CLINICAL_CONDITIONS.cardiac_emergency,
      matchedSymptoms: ['Chest Pain / Angina', 'Acute Emergency Presentation'],
    };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // RULE 4: HIGH BP SYMPTOMS (HEADACHE + DIZZINESS + BLURRED VISION) → HYPERTENSIVE CRISIS (RED)
  // ──────────────────────────────────────────────────────────────────────────
  if (
    (tags.highBp && (tags.headache || tags.dizziness || tags.blurredVision)) ||
    (tags.headache && tags.dizziness && tags.blurredVision)
  ) {
    const matched: string[] = [];
    if (tags.highBp) matched.push('Elevated Blood Pressure');
    if (tags.headache) matched.push('Severe Headache');
    if (tags.dizziness) matched.push('Dizziness / Vertigo');
    if (tags.blurredVision) matched.push('Blurred Vision');

    return {
      ...CLINICAL_CONDITIONS.hypertensive_crisis,
      matchedSymptoms: matched,
    };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // RULE 5: COUGH + FEVER + BREATHLESSNESS → RESPIRATORY INFECTION (YELLOW)
  // ──────────────────────────────────────────────────────────────────────────
  if (tags.cough && tags.fever && tags.breathlessness) {
    return {
      ...CLINICAL_CONDITIONS.respiratory_infection,
      matchedSymptoms: ['Cough', 'Fever', 'Breathlessness / Difficulty Breathing'],
    };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // RULE 6: FEVER + HEADACHE + BODY ACHE → DENGUE / MALARIA SUSPICION (YELLOW)
  // ──────────────────────────────────────────────────────────────────────────
  if (tags.fever && (tags.headache && tags.bodyAche)) {
    return {
      ...CLINICAL_CONDITIONS.dengue_malaria,
      matchedSymptoms: ['Fever / High Temperature', 'Headache', 'Generalized Body Ache'],
    };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // RULE 7: DIARRHEA + VOMITING + DEHYDRATION → ACUTE GASTROENTERITIS (YELLOW)
  // ──────────────────────────────────────────────────────────────────────────
  if (
    (tags.diarrhea && tags.vomiting && tags.dehydration) ||
    (tags.diarrhea && tags.vomiting) ||
    (tags.diarrhea && tags.dehydration) ||
    (tags.vomiting && tags.dehydration)
  ) {
    const matched: string[] = [];
    if (tags.diarrhea) matched.push('Diarrhea / Loose Motions');
    if (tags.vomiting) matched.push('Vomiting / Nausea');
    if (tags.dehydration) matched.push('Dehydration Signs / Extreme Thirst');

    return {
      ...CLINICAL_CONDITIONS.acute_gastroenteritis,
      matchedSymptoms: matched,
    };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // RULE 8: MILD FEVER + COLD → COMMON COLD (GREEN)
  // ──────────────────────────────────────────────────────────────────────────
  if (
    (tags.mildFever && tags.cold) ||
    (tags.fever && tags.cold && !tags.breathlessness && !tags.bodyAche) ||
    (norm.includes('mild fever') && norm.includes('cold')) ||
    (norm.includes('common cold'))
  ) {
    return {
      ...CLINICAL_CONDITIONS.common_cold,
      matchedSymptoms: ['Mild Low-grade Fever', 'Cold / Runny Nose / Sneezing'],
    };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // RULE 9: SKIN RASH + ITCHING → DERMATITIS (GREEN)
  // ──────────────────────────────────────────────────────────────────────────
  if (tags.skinRash && tags.itching) {
    return {
      ...CLINICAL_CONDITIONS.dermatitis,
      matchedSymptoms: ['Skin Rash / Redness', 'Severe Itching / Pruritus'],
    };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // RULE 10: JOINT PAIN + SWELLING → ARTHRITIS (GREEN)
  // ──────────────────────────────────────────────────────────────────────────
  if (tags.jointPain && tags.swelling) {
    return {
      ...CLINICAL_CONDITIONS.arthritis,
      matchedSymptoms: ['Joint Pain / Arthralgia', 'Joint Swelling / Inflammation'],
    };
  }

  // Additional single-feature fallbacks if specific rule phrases were provided in prompt
  if (norm.includes('fever') && norm.includes('headache') && norm.includes('body')) {
    return {
      ...CLINICAL_CONDITIONS.dengue_malaria,
      matchedSymptoms: ['Fever', 'Headache', 'Body ache'],
    };
  }

  if (norm.includes('chest') && norm.includes('breath')) {
    return {
      ...CLINICAL_CONDITIONS.cardiac_emergency,
      matchedSymptoms: ['Chest pain', 'Breathlessness'],
    };
  }

  if (norm.includes('cough') && norm.includes('breath') && norm.includes('fever')) {
    return {
      ...CLINICAL_CONDITIONS.respiratory_infection,
      matchedSymptoms: ['Cough', 'Fever', 'Breathlessness'],
    };
  }

  return null;
}

/**
 * Generates clarifying follow-up prompts when input is partial or singular
 */
function getClarifyingOptions(userInput: string): { message: string; options: FollowUpOption[] } | null {
  const norm = normalizeInput(userInput);
  const tags = detectKeywords(norm);

  // If user mentions just fever
  if (tags.fever && !tags.headache && !tags.bodyAche && !tags.cough && !tags.cold) {
    return {
      message:
        'I noted that you have a fever. To provide an accurate triage level and direct you to the correct facility, are you experiencing any of these accompanying symptoms?',
      options: [
        { label: 'Fever + Headache + Body Ache', query: 'fever + headache + body ache' },
        { label: 'Cough + Fever + Breathlessness', query: 'cough + fever + breathlessness' },
        { label: 'Mild Fever + Cold / Sneezing', query: 'mild fever + cold' },
      ],
    };
  }

  // If user mentions just chest pain
  if (tags.chestPain && !tags.breathlessness) {
    return {
      message:
        '⚠️ Chest discomfort is an alarming symptom that must be evaluated quickly. Are you having any shortness of breath, perspiration, or nausea?',
      options: [
        { label: 'Chest Pain + Breathlessness (Urgent)', query: 'chest pain + breathlessness' },
        { label: 'Mild localized chest wall ache without breathlessness', query: 'mild chest discomfort without breathlessness' },
      ],
    };
  }

  // If user mentions just pregnancy
  if (tags.pregnancy && !tags.bleeding && !tags.severePain && !tags.highBp) {
    return {
      message:
        'Pregnancy symptoms require prioritized care. Which of the following best describes your current complication?',
      options: [
        { label: 'Pregnancy + Bleeding / Severe Pain', query: 'pregnancy + bleeding and severe pain' },
        { label: 'Pregnancy + High BP / Swelling / Headache', query: 'pregnancy + high BP with headache' },
        { label: 'Routine Antenatal Check-up query', query: 'routine pregnancy checkup' },
      ],
    };
  }

  // If user mentions breathing difficulties alone
  if (tags.breathlessness && !tags.chestPain && !tags.cough) {
    return {
      message:
        'Breathing difficulties require urgent assessment. Do you also have chest pain or a fever with cough?',
      options: [
        { label: 'Chest Pain + Breathlessness', query: 'chest pain + breathlessness' },
        { label: 'Cough + Fever + Breathlessness', query: 'cough + fever + breathlessness' },
      ],
    };
  }

  // If user mentions stomach or vomiting alone
  if ((tags.vomiting || tags.diarrhea) && !tags.dehydration) {
    return {
      message:
        'Stomach distress detected. Are you experiencing diarrhea, recurrent vomiting, and dehydration?',
      options: [
        { label: 'Diarrhea + Vomiting + Dehydration', query: 'diarrhea + vomiting + dehydration' },
        { label: 'Mild indigestion / occasional nausea', query: 'mild stomach ache' },
      ],
    };
  }

  // If user mentions just skin rash or just itching
  if ((tags.skinRash || tags.itching) && !(tags.skinRash && tags.itching)) {
    return {
      message:
        'Skin symptoms detected. Do you have both visible skin rashes and persistent itching?',
      options: [
        { label: 'Skin Rash + Itching', query: 'skin rash + itching' },
        { label: 'Dry skin without rash', query: 'dry skin only' },
      ],
    };
  }

  // If user mentions just joint pain or just swelling
  if ((tags.jointPain || tags.swelling) && !(tags.jointPain && tags.swelling)) {
    return {
      message:
        'Musculoskeletal symptoms detected. Is the joint swollen as well as painful?',
      options: [
        { label: 'Joint Pain + Swelling', query: 'joint pain + swelling' },
        { label: 'Mild muscle ache after physical work', query: 'muscle soreness' },
      ],
    };
  }

  return null;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function SymptomChecker({ onClose, onTriageComplete }: SymptomCheckerProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-initial',
      sender: 'bot',
      text:
        'Namaste! I am the SwasthyaSetu AI Health Assistant. I use a local clinical triage engine (aligned with National Health Mission protocols) to analyze your symptoms and suggest whether you need emergency care, urgent facility review, or routine outpatient guidance.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputValue, setInputValue] = useState('');
  const [isAssessing, setIsAssessing] = useState(false);
  const [latestTriage, setLatestTriage] = useState<TriageResult | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isAssessing]);

  // Focus input on load
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Quick Action Buttons at the top of the chat
  const quickActions: { label: string; icon: string; query: string }[] = [
    { label: 'Fever', icon: '🌡️', query: 'Fever' },
    { label: 'Chest Pain', icon: '🫀', query: 'Chest pain + breathlessness' },
    { label: 'Pregnancy Issue', icon: '🤰', query: 'Pregnancy issue' },
    { label: 'Breathing Problem', icon: '🫁', query: 'Breathing problem' },
    { label: 'Stomach Problem', icon: '🤢', query: 'Diarrhea + vomiting + dehydration' },
  ];

  const handleProcessQuery = (queryText: string) => {
    const trimmed = queryText.trim();
    if (!trimmed) return;

    // 1. Add User Message
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsAssessing(true);

    // 2. Evaluate Rule-based Engine with realistic short typing delay
    setTimeout(() => {
      const triageMatch = evaluateTriageEngine(trimmed);

      if (triageMatch) {
        // Complete match found
        setLatestTriage(triageMatch);
        if (onTriageComplete) {
          onTriageComplete(triageMatch);
        }

        const botReply: ChatMessage = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: `I have completed the clinical triage assessment for your reported symptoms: "${triageMatch.matchedSymptoms.join(', ')}". Please review the priority card below for recommended healthcare facility routing.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          triage: triageMatch,
        };

        setMessages((prev) => [...prev, botReply]);
      } else {
        // Check for partial / clarifying options
        const clarifying = getClarifyingOptions(trimmed);

        if (clarifying) {
          const botReply: ChatMessage = {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: clarifying.message,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            followUpOptions: clarifying.options,
          };
          setMessages((prev) => [...prev, botReply]);
        } else {
          // Fallback guidance
          const botReply: ChatMessage = {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text:
              'I could not match your exact symptom combination to a predefined critical triage protocol. Could you specify more details? For example:\n• "Fever + headache + body ache"\n• "Chest pain + breathlessness"\n• "High BP symptoms (headache, dizziness, blurred vision)"\n• "Pregnancy + bleeding / severe pain"\n• "Cough + fever + breathlessness"\n• "Diarrhea + vomiting + dehydration"\n• "Skin rash + itching" or "Joint pain + swelling"',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            followUpOptions: [
              { label: 'Fever + Headache + Body Ache', query: 'fever + headache + body ache' },
              { label: 'Chest Pain + Breathlessness', query: 'chest pain + breathlessness' },
              { label: 'High BP (Headache, Dizziness, Blurry Vision)', query: 'headache, dizziness, blurred vision' },
              { label: 'Pregnancy + Bleeding / Pain', query: 'pregnancy + bleeding and severe pain' },
              { label: 'Skin Rash + Itching', query: 'skin rash + itching' },
            ],
          };
          setMessages((prev) => [...prev, botReply]);
        }
      }

      setIsAssessing(false);
    }, 450);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleProcessQuery(inputValue);
  };

  const handleResetConversation = () => {
    setLatestTriage(null);
    setMessages([
      {
        id: `initial-${Date.now()}`,
        sender: 'bot',
        text:
          'Reset complete. Please describe your new symptoms or click any quick action below to start a new clinical assessment.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="fixed inset-0 z-[150] bg-black/65 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col h-[92vh] max-h-[820px] overflow-hidden">
        
        {/* ================================================================== */}
        {/* MODAL HEADER */}
        {/* ================================================================== */}
        <div className="px-5 py-4 bg-gradient-to-r from-teal-700 via-teal-800 to-slate-900 text-white flex items-center justify-between shrink-0 shadow-sm border-b border-teal-600/30">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-300/30 flex items-center justify-center text-teal-200 shadow-inner">
                <Bot className="w-5 h-5 text-teal-300" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-slate-900 rounded-full" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  SwasthyaSetu AI Health Assistant
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-teal-500/30 text-teal-200 border border-teal-400/30">
                  Local AI Engine
                </span>
              </div>
              <p className="text-xs text-teal-100/80 flex items-center gap-1.5 mt-0.5">
                <Sparkles className="w-3 h-3 text-teal-300" />
                Rule-Based Clinical Triage · Offline Capable · NHM Standard
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleResetConversation}
              title="Reset Chat"
              className="p-2 text-teal-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-xs flex items-center gap-1"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Reset</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-teal-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Close Symptom Checker"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ================================================================== */}
        {/* CLINICAL NOTICE BANNER */}
        {/* ================================================================== */}
        <div className="bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900/50 px-4 py-2 flex items-center justify-between text-xs text-amber-800 dark:text-amber-300 shrink-0">
          <div className="flex items-center gap-2 truncate">
            <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="truncate">
              Triage tool only. In life-threatening emergencies, call{' '}
              <strong className="font-semibold underline">108 Ambulance</strong> immediately.
            </span>
          </div>
          <span className="text-[10px] font-medium bg-amber-200/60 dark:bg-amber-900/60 px-2 py-0.5 rounded ml-2 shrink-0">
            No External APIs
          </span>
        </div>

        {/* ================================================================== */}
        {/* QUICK ACTION BUTTONS */}
        {/* ================================================================== */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900/70 border-b border-slate-200/80 dark:border-slate-800 shrink-0">
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <Activity className="w-3 h-3 text-teal-600 dark:text-teal-400" />
            Quick Select Common Complaints:
          </p>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
            {quickActions.map((item) => (
              <button
                key={item.label}
                onClick={() => handleProcessQuery(item.query)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium hover:bg-teal-50 dark:hover:bg-teal-950/40 hover:border-teal-300 dark:hover:border-teal-700 hover:text-teal-700 dark:hover:text-teal-300 transition-all shrink-0 active:scale-95 shadow-xs"
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ================================================================== */}
        {/* CHAT MESSAGES SCROLL AREA */}
        {/* ================================================================== */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-100/50 dark:bg-slate-950/50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'bot' && (
                <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-[88%] sm:max-w-[82%] space-y-3`}>
                <div
                  className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-xs ${
                    msg.sender === 'user'
                      ? 'bg-teal-600 text-white rounded-br-none ml-auto'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700 rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                  <div
                    className={`text-[10px] mt-1.5 text-right ${
                      msg.sender === 'user' ? 'text-teal-200' : 'text-slate-400'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>

                {/* Follow-up Interactive Chips if offered by Bot */}
                {msg.followUpOptions && msg.followUpOptions.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1 animate-in fade-in duration-300">
                    {msg.followUpOptions.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => handleProcessQuery(opt.query)}
                        className="text-xs bg-teal-50 dark:bg-teal-950/50 hover:bg-teal-100 dark:hover:bg-teal-900 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-200 px-3 py-1.5 rounded-xl font-medium transition-colors text-left flex items-center gap-1.5 shadow-xs"
                      >
                        <ChevronRight className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                        <span>{opt.label}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* TRIAGE RESULT CARD */}
                {msg.triage && <TriageCard triage={msg.triage} />}
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-full bg-slate-700 dark:bg-slate-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isAssessing && (
            <div className="flex gap-3 items-center">
              <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-2xl rounded-bl-none text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 shadow-xs">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-teal-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-teal-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-teal-600 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span>Evaluating symptoms against clinical protocols…</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ================================================================== */}
        {/* BOTTOM INPUT FORM */}
        {/* ================================================================== */}
        <div className="p-3 sm:p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
          <form onSubmit={handleFormSubmit} className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type symptoms (e.g. fever + headache + body ache)..."
                disabled={isAssessing}
                className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 focus:border-teal-500 dark:focus:border-teal-400 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none transition-all pr-10 disabled:opacity-60"
              />
              {inputValue && (
                <button
                  type="button"
                  onClick={() => setInputValue('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={!inputValue.trim() || isAssessing}
              className="bg-teal-600 hover:bg-teal-700 active:scale-95 disabled:opacity-50 disabled:pointer-events-none text-white px-5 py-3 rounded-xl font-semibold text-sm transition-all shadow-md shadow-teal-600/20 flex items-center justify-center gap-2 shrink-0"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Check</span>
            </button>
          </form>

          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
            <span className="flex items-center gap-1">
              <Info className="w-3 h-3 text-slate-400" />
              Supported: Fever, Chest Pain, High BP, Pregnancy, Respiration, Gastro, Cold, Rash, Arthritis
            </span>
            <span className="hidden sm:inline font-mono">v1.2 Local Clinical Engine</span>
          </div>
        </div>

      </div>
    </div>
  );
}

// ============================================================================
// TRIAGE RESULT CARD SUB-COMPONENT
// ============================================================================

function TriageCard({ triage }: { triage: TriageResult }) {
  const isRed = triage.priority === 'RED';
  const isYellow = triage.priority === 'YELLOW';
  const isGreen = triage.priority === 'GREEN';

  // Dynamic color token classes
  const colorMap = {
    RED: {
      cardBg: 'bg-red-50/80 dark:bg-red-950/30',
      border: 'border-red-400 dark:border-red-700',
      badgeBg: 'bg-red-600 text-white',
      badgeBorder: 'border-red-600',
      titleColor: 'text-red-950 dark:text-red-100',
      subtitleColor: 'text-red-700 dark:text-red-300',
      iconBg: 'bg-red-600 text-white',
      accentTag: 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800',
      facilityCard: 'bg-white dark:bg-slate-900 border-red-200 dark:border-red-800 text-slate-900 dark:text-white',
      pulseDot: 'bg-red-500',
    },
    YELLOW: {
      cardBg: 'bg-amber-50/80 dark:bg-amber-950/30',
      border: 'border-amber-400 dark:border-amber-700',
      badgeBg: 'bg-amber-500 text-slate-950 font-bold',
      badgeBorder: 'border-amber-500',
      titleColor: 'text-amber-950 dark:text-amber-100',
      subtitleColor: 'text-amber-700 dark:text-amber-300',
      iconBg: 'bg-amber-500 text-slate-950',
      accentTag: 'bg-amber-100 dark:bg-amber-900/50 text-amber-900 dark:text-amber-200 border-amber-200 dark:border-amber-800',
      facilityCard: 'bg-white dark:bg-slate-900 border-amber-200 dark:border-amber-800 text-slate-900 dark:text-white',
      pulseDot: 'bg-amber-500',
    },
    GREEN: {
      cardBg: 'bg-emerald-50/80 dark:bg-emerald-950/30',
      border: 'border-emerald-400 dark:border-emerald-700',
      badgeBg: 'bg-emerald-600 text-white',
      badgeBorder: 'border-emerald-600',
      titleColor: 'text-emerald-950 dark:text-emerald-100',
      subtitleColor: 'text-emerald-700 dark:text-emerald-300',
      iconBg: 'bg-emerald-600 text-white',
      accentTag: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-900 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800',
      facilityCard: 'bg-white dark:bg-slate-900 border-emerald-200 dark:border-emerald-800 text-slate-900 dark:text-white',
      pulseDot: 'bg-emerald-500',
    },
  }[triage.priority];

  return (
    <div
      className={`rounded-2xl border-2 ${colorMap.border} ${colorMap.cardBg} p-4 sm:p-5 shadow-md space-y-4 transition-all animate-in fade-in zoom-in-95 duration-200`}
    >
      {/* ── PRIORITY HEADER ── */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${colorMap.iconBg}`}>
            {isRed && <AlertTriangle className="w-5 h-5 text-white animate-pulse" />}
            {isYellow && <Clock className="w-5 h-5 text-slate-950" />}
            {isGreen && <CheckCircle2 className="w-5 h-5 text-white" />}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${colorMap.badgeBg}`}>
                {triage.priorityLabel}
              </span>
              <span className={`w-2 h-2 rounded-full ${colorMap.pulseDot} animate-ping`} />
            </div>
            <h3 className={`text-base font-bold leading-tight mt-1 ${colorMap.titleColor}`}>
              {triage.condition}
            </h3>
            <p className={`text-xs font-medium mt-0.5 ${colorMap.subtitleColor}`}>
              {triage.marathiCondition}
            </p>
          </div>
        </div>
      </div>

      {/* ── SUMMARY PARAGRAPH ── */}
      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-white/70 dark:bg-slate-900/70 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
        {triage.summary}
      </p>

      {/* ── FACILITY RECOMMENDATION CARD ── */}
      <div className={`rounded-xl border p-3.5 space-y-2 ${colorMap.facilityCard}`}>
        <div className="flex items-start gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 flex items-center justify-center shrink-0">
            <Building2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
                Recommended Facility Level
              </p>
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                {triage.timeframe}
              </span>
            </div>
            <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 leading-snug">
              {triage.facilityType}
            </p>
          </div>
        </div>
      </div>

      {/* ── CLINICAL INSTRUCTIONS CHECKLIST ── */}
      <div className="space-y-1.5">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <Stethoscope className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
          Immediate Medical Actions:
        </p>
        <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
          {triage.keyInstructions.map((inst, i) => (
            <li key={i} className="flex items-start gap-2 leading-relaxed">
              <span className="text-teal-600 dark:text-teal-400 font-bold shrink-0 mt-0.5">•</span>
              <span>{inst}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* ── WARNING SIGNS (RED FLAGS) ── */}
      {triage.warningSigns && triage.warningSigns.length > 0 && (
        <div className="bg-red-50/90 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 rounded-xl p-3 space-y-1.5">
          <p className="text-[11px] font-bold text-red-800 dark:text-red-300 uppercase tracking-wider flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
            Watch for Critical Red Flags:
          </p>
          <ul className="space-y-0.5 text-xs text-red-700 dark:text-red-300">
            {triage.warningSigns.map((w, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-red-500 font-semibold shrink-0">⚠</span>
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── ACTION BUTTONS / QUICK DIAL ── */}
      <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        {isRed && (
          <a
            href="tel:108"
            className="flex-1 bg-red-600 hover:bg-red-700 active:scale-98 text-white font-bold py-3 px-4 rounded-xl text-center text-xs tracking-wider uppercase transition-all shadow-md shadow-red-600/30 flex items-center justify-center gap-2"
          >
            <Phone className="w-4 h-4 animate-bounce" />
            Call 108 Emergency Ambulance (Free)
          </a>
        )}

        {(isYellow || isGreen) && (
          <a
            href="tel:104"
            className="flex-1 bg-teal-600 hover:bg-teal-700 active:scale-98 text-white font-bold py-2.5 px-4 rounded-xl text-center text-xs transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <Phone className="w-4 h-4" />
            Call 104 Tele-Health Helpline
          </a>
        )}
      </div>
    </div>
  );
}
