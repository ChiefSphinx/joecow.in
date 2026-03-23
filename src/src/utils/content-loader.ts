import cvData from '../../data/cv.json';
import terminalContent from '../../data/terminal-content.json';

export interface CVData {
  name: string;
  title: string;
  summary: string;
  selectedAchievements: string[];
  experience: Experience[];
  technicalSkills: Record<string, string>;
  education: Education[];
  certifications: string[];
  contact: Contact;
}

export interface Experience {
  company: string;
  location: string;
  duration: string;
  positions: Position[];
}

export interface Position {
  title: string;
  period: string;
  achievements: string[];
  skills: string[];
}

export interface Education {
  degree: string;
  institution: string;
  year: string;
}

export interface Contact {
  phone: string;
  email: string;
  github: string;
  linkedin: string;
}

export interface TerminalContent {
  welcome: {
    greeting: string;
    instruction: string;
    asciiArt?: string[];
    mobileAsciiArt?: string[];
  };
  files: string[];
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(isString);
}

function isContact(value: unknown): value is Contact {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return isString(obj.phone) && isString(obj.email) && isString(obj.github) && isString(obj.linkedin);
}

function isEducation(value: unknown): value is Education {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return isString(obj.degree) && isString(obj.institution) && isString(obj.year);
}

function isTechnicalSkills(value: unknown): value is Record<string, string> {
  if (typeof value !== 'object' || value === null) return false;
  return Object.values(value as Record<string, unknown>).every(isString);
}

function isPosition(value: unknown): value is Position {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    isString(obj.title) &&
    isString(obj.period) &&
    isStringArray(obj.achievements) &&
    isStringArray(obj.skills)
  );
}

function isExperience(value: unknown): value is Experience {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    isString(obj.company) &&
    isString(obj.location) &&
    isString(obj.duration) &&
    Array.isArray(obj.positions) &&
    obj.positions.every(isPosition)
  );
}

function isCVData(value: unknown): value is CVData {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    isString(obj.name) &&
    isString(obj.title) &&
    isString(obj.summary) &&
    isStringArray(obj.selectedAchievements) &&
    Array.isArray(obj.experience) &&
    obj.experience.every(isExperience) &&
    isTechnicalSkills(obj.technicalSkills) &&
    Array.isArray(obj.education) &&
    (obj.education as unknown[]).every(isEducation) &&
    isStringArray(obj.certifications) &&
    isContact(obj.contact)
  );
}

function isTerminalContent(value: unknown): value is TerminalContent {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;

  const welcome = obj.welcome;
  if (typeof welcome !== 'object' || welcome === null) return false;
  const welcomeObj = welcome as Record<string, unknown>;
  if (!isString(welcomeObj.greeting) || !isString(welcomeObj.instruction)) return false;
  if (welcomeObj.asciiArt !== undefined && !isStringArray(welcomeObj.asciiArt)) return false;
  if (welcomeObj.mobileAsciiArt !== undefined && !isStringArray(welcomeObj.mobileAsciiArt)) return false;

  return isStringArray(obj.files);
}

function validateCVData(data: unknown): CVData {
  if (!isCVData(data)) {
    throw new Error('Invalid CV data structure');
  }
  return data;
}

function validateTerminalContent(data: unknown): TerminalContent {
  if (!isTerminalContent(data)) {
    throw new Error('Invalid terminal content structure');
  }
  return data;
}

const validatedCVData = validateCVData(cvData);
const validatedTerminalContent = validateTerminalContent(terminalContent);

export function getCVData(): CVData {
  return validatedCVData;
}

export function getTerminalContent(): TerminalContent {
  return validatedTerminalContent;
}

export function formatCV(): string {
  const cv = getCVData();

  let content = `\n${cv.name} — ${cv.title}\n\n`;

  content += `\uf0c8 Summary:\n${cv.summary}\n\n`;

  content += `\uf091 Selected Achievements:\n`;
  cv.selectedAchievements.forEach(a => {
    content += `  • ${a}\n`;
  });
  content += `\n`;

  content += `\uf0b1 Experience:\n\n`;
  cv.experience.forEach(exp => {
    content += `  ${exp.company}`;
    if (exp.location) content += ` | ${exp.location}`;
    if (exp.duration) content += ` (${exp.duration})`;
    content += `\n`;

    exp.positions.forEach(position => {
      content += `\n    ${position.title}\n`;
      content += `    ${position.period}\n`;
      position.achievements.forEach(achievement => {
        content += `    • ${achievement}\n`;
      });
      if (position.skills.length > 0) {
        content += `    Skills: ${position.skills.join(', ')}\n`;
      }
    });
    content += `\n`;
  });

  content += `\ue796 Technical Skills:\n`;
  Object.entries(cv.technicalSkills).forEach(([category, detail]) => {
    content += `  ${category}: ${detail}\n`;
  });
  content += `\n`;

  content += `\uf19d Education:\n`;
  cv.education.forEach(edu => {
    content += `  ${edu.degree}\n`;
    content += `  ${edu.institution}, ${edu.year}\n`;
  });
  content += `\n`;

  content += `\uf0a3 Certifications:\n`;
  cv.certifications.forEach(cert => {
    content += `  • ${cert}\n`;
  });
  content += `\n`;

  content += `\uf2b5 Contact:\n`;
  content += `  \uf095 Phone:    ${cv.contact.phone}\n`;
  content += `  \uf0e0 Email:    mailto:${cv.contact.email}\n`;
  content += `  \uf09b GitHub:   ${cv.contact.github}\n`;
  content += `  \uf0e1 LinkedIn: ${cv.contact.linkedin}\n`;

  return content;
}

export function formatContact(): string {
  const cv = getCVData();
  let content = '\n\uf2b5 Contact Information:\n';
  content += `  \uf0e0 Email:    mailto:${cv.contact.email}\n`;
  content += `  \uf09b GitHub:   ${cv.contact.github}\n`;
  content += `  \uf0e1 LinkedIn: ${cv.contact.linkedin}\n`;
  return content;
}

const FILE_ICONS: Record<string, string> = {
  '.md': '\ue73e',    // markdown icon
  '.txt': '\uf15c',   // file-text icon
  '.json': '\ue60b',  // json icon
  '.ts': '\ue628',    // typescript icon
  '.js': '\ue74e',    // javascript icon
};

function getFileIcon(filename: string): string {
  const ext = filename.substring(filename.lastIndexOf('.'));
  return FILE_ICONS[ext] || '\uf15b'; // default file icon
}

export function formatFiles(): string {
  const terminal = getTerminalContent();
  const filesWithIcons = terminal.files.map(f => `${getFileIcon(f)} ${f}`);
  return `\n${filesWithIcons.join('\n')}\n`;
}

export function getWelcomeMessages(isMobile = false): { greeting: string; instruction: string; asciiArt?: string[] } {
  const terminal = getTerminalContent();
  const asciiArt = isMobile && terminal.welcome.mobileAsciiArt
    ? terminal.welcome.mobileAsciiArt
    : terminal.welcome.asciiArt;
  return {
    greeting: terminal.welcome.greeting,
    instruction: terminal.welcome.instruction,
    asciiArt,
  };
}
