import cvData from '../data/cv.json';
import terminalContent from '../data/terminal-content.json';

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

export function getCVData(): CVData {
  return cvData as CVData;
}

export function getTerminalContent(): TerminalContent {
  return terminalContent as TerminalContent;
}

export function formatCV(): string {
  const cv = getCVData();
  
  let content = `\\nName: ${cv.name}\\n`;
  content += `Title: ${cv.title}\\n`;
  content += `About: ${cv.about}\\n\\n`;
  content += `Experience:\\n\\n`;

  cv.experience.forEach(exp => {
    content += `🏢 ${exp.company}`;
    if (exp.duration) {
      content += ` (${exp.duration})`;
    }
    if (exp.location) {
      content += ` | ${exp.location}`;
    }
    content += `\\n\\n`;

    exp.positions.forEach(position => {
      content += `  📍 ${position.title} (${position.period})\\n`;
      position.achievements.forEach(achievement => {
        content += `  • ${achievement}\\n`;
      });
      if (position.skills.length > 0) {
        content += `  Skills: ${position.skills.join(', ')}\\n`;
      }
      content += `\\n`;
    });
  });

  content += `Core Skills: ${cv.coreSkills.join(', ')}\\n\\n`;
  content += `Contact: \\n`;
  content += `  Email: ${cv.contact.email}\\n`;
  content += `  GitHub: ${cv.contact.github}\\n`;
  content += `  LinkedIn: ${cv.contact.linkedin}\\n`;

  return content;
}

export function formatHelp(): string {
  const terminal = getTerminalContent();
  
  let content = `\\n${terminal.help.title}\\n`;
  terminal.help.commands.forEach(cmd => {
    const padding = ' '.repeat(Math.max(2, 14 - cmd.command.length));
    content += `  ${cmd.command}${padding}- ${cmd.description}\\n`;
  });
  
  return content;
}

export function formatFiles(): string {
  const terminal = getTerminalContent();
  return `\\n${terminal.files.join('\\n')}\\n`;
}

export function getWelcomeMessages(): { greeting: string; instruction: string } {
  const terminal = getTerminalContent();
  return {
    greeting: terminal.welcome.greeting,
    instruction: terminal.welcome.instruction
  };
}
