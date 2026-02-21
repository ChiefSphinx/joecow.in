import cvData from '../../data/cv.json';
import terminalContent from '../../data/terminal-content.json';

export interface CVData {
  name: string;
  title: string;
  about: string;
  experience: Experience[];
  coreSkills: string[];
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

export interface Contact {
  email: string;
  github: string;
  linkedin: string;
}

export interface TerminalContent {
  welcome: {
    greeting: string;
    instruction: string;
    asciiArt?: string[];
  };
  help: {
    title: string;
    commands: Array<{
      command: string;
      description: string;
    }>;
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
  return isString(obj.email) && isString(obj.github) && isString(obj.linkedin);
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
    isString(obj.about) &&
    Array.isArray(obj.experience) &&
    obj.experience.every(isExperience) &&
    isStringArray(obj.coreSkills) &&
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

  const help = obj.help;
  if (typeof help !== 'object' || help === null) return false;
  const helpObj = help as Record<string, unknown>;
  if (!isString(helpObj.title)) return false;
  if (!Array.isArray(helpObj.commands)) return false;
  for (const cmd of helpObj.commands) {
    if (typeof cmd !== 'object' || cmd === null) return false;
    const cmdObj = cmd as Record<string, unknown>;
    if (!isString(cmdObj.command) || !isString(cmdObj.description)) return false;
  }

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
  
  let content = `\nName: ${cv.name}\n`;
  content += `Title: ${cv.title}\n`;
  content += `About: ${cv.about}\n\n`;
  content += `Experience:\n\n`;

  cv.experience.forEach(exp => {
    content += `🏢 ${exp.company}`;
    if (exp.duration) {
      content += ` (${exp.duration})`;
    }
    if (exp.location) {
      content += ` | ${exp.location}`;
    }
    content += `\n\n`;

    exp.positions.forEach(position => {
      content += `  📍 ${position.title} (${position.period})\n`;
      position.achievements.forEach(achievement => {
        content += `  • ${achievement}\n`;
      });
      if (position.skills.length > 0) {
        content += `  Skills: ${position.skills.join(', ')}\n`;
      }
      content += `\n`;
    });
  });

  content += `Core Skills: ${cv.coreSkills.join(', ')}\n\n`;
  content += `Contact: \n`;
  content += `  Email: ${cv.contact.email}\n`;
  content += `  GitHub: ${cv.contact.github}\n`;
  content += `  LinkedIn: ${cv.contact.linkedin}\n`;

  return content;
}

export function formatHelp(): string {
  const terminal = getTerminalContent();
  
  let content = `\n${terminal.help.title}\n`;
  terminal.help.commands.forEach(cmd => {
    const padding = ' '.repeat(Math.max(2, 14 - cmd.command.length));
    content += `  ${cmd.command}${padding}- ${cmd.description}\n`;
  });
  
  return content;
}

export function formatFiles(): string {
  const terminal = getTerminalContent();
  return `\n${terminal.files.join('\n')}\n`;
}

export function getWelcomeMessages(): { greeting: string; instruction: string; asciiArt?: string[] } {
  const terminal = getTerminalContent();
  return {
    greeting: terminal.welcome.greeting,
    instruction: terminal.welcome.instruction,
    asciiArt: terminal.welcome.asciiArt
  };
}
