// Resume data types and interfaces

export interface ResumeExperience {
  title: string;
  company: string;
  duration: string;
  description: string;
  achievements?: string[];
}

export interface ResumeEducation {
  degree: string;
  school: string;
  year: string;
  gpa?: string;
  honors?: string;
}

export interface ResumeContact {
  email: string;
  phone: string;
  location?: string;
  linkedin?: string;
  website?: string;
}

export interface EnhancedResume {
  name: string;
  title: string;
  contact: ResumeContact;
  summary: string;
  experience: ResumeExperience[];
  education: ResumeEducation[];
  skills: string[];
  certifications?: string[];
  projects?: Array<{
    name: string;
    description: string;
    technologies: string[];
  }>;
}

export interface ResumeEnhancementResult {
  original: string;
  enhanced: EnhancedResume;
  improvements: string[];
  score: number;
}