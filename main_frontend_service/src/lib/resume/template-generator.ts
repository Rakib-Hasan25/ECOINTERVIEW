// Resume template generation and PDF export

import { EnhancedResume } from './types';

export interface ResumeTemplate {
  id: number;
  name: string;
  description: string;
  preview: string;
  color: string;
}

export class TemplateGenerator {
  static readonly templates: ResumeTemplate[] = [
    {
      id: 1,
      name: "Modern Professional",
      description: "Clean design perfect for tech and creative roles",
      preview: "bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20",
      color: "border-blue-500"
    },
    {
      id: 2,
      name: "Executive Classic", 
      description: "Traditional format ideal for senior positions",
      preview: "bg-gradient-to-br from-gray-50 to-slate-100 dark:from-gray-800 dark:to-slate-800",
      color: "border-gray-500"
    },
    {
      id: 3,
      name: "Creative Minimal",
      description: "Stylish layout for creative professionals", 
      preview: "bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20",
      color: "border-purple-500"
    },
    {
      id: 4,
      name: "Corporate Standard",
      description: "Professional format for corporate roles",
      preview: "bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20", 
      color: "border-green-500"
    }
  ];

  /**
   * Generate HTML content for a specific template with enhanced resume data
   * Each template uses its corresponding variation if available
   */
  static generateTemplateHTML(templateId: number, resumeData: EnhancedResume, variations?: EnhancedResume[]): string {
    // Use the variation specific to this template if available
    const templateData = variations && variations[templateId - 1] ? variations[templateId - 1] : resumeData;
    
    switch (templateId) {
      case 1:
        return this.generateModernTemplate(templateData);
      case 2:
        return this.generateExecutiveTemplate(templateData);
      case 3:
        return this.generateCreativeTemplate(templateData);
      case 4:
        return this.generateCorporateTemplate(templateData);
      default:
        return this.generateModernTemplate(templateData);
    }
  }

  private static generateModernTemplate(resume: EnhancedResume): string {
    return `
      <div style="max-width: 800px; margin: 0 auto; background: white; padding: 40px; font-family: 'Arial', sans-serif;">
        <!-- Header -->
        <div style="text-align: center; border-bottom: 3px solid #3B82F6; padding-bottom: 20px; margin-bottom: 30px;">
          <h1 style="font-size: 32px; font-weight: bold; color: #1F2937; margin: 0;">${resume.name}</h1>
          <h2 style="font-size: 18px; color: #3B82F6; margin: 10px 0;">${resume.title}</h2>
          <div style="font-size: 14px; color: #6B7280;">
            ${resume.contact.email} • ${resume.contact.phone}
            ${resume.contact.location ? ` • ${resume.contact.location}` : ''}
          </div>
        </div>

        <!-- Professional Summary -->
        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 16px; font-weight: bold; color: #3B82F6; margin-bottom: 10px;">PROFESSIONAL SUMMARY</h3>
          <p style="font-size: 14px; line-height: 1.6; color: #4B5563; margin: 0;">${resume.summary}</p>
        </div>

        <!-- Experience -->
        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 16px; font-weight: bold; color: #3B82F6; margin-bottom: 15px;">EXPERIENCE</h3>
          ${resume.experience.map(exp => `
            <div style="margin-bottom: 20px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                <h4 style="font-size: 14px; font-weight: bold; color: #1F2937; margin: 0;">${exp.title}</h4>
                <span style="font-size: 12px; color: #6B7280;">${exp.duration}</span>
              </div>
              <div style="font-size: 13px; color: #3B82F6; margin-bottom: 8px;">${exp.company}</div>
              <p style="font-size: 13px; line-height: 1.5; color: #4B5563; margin: 0 0 8px 0;">${exp.description}</p>
              ${exp.achievements ? exp.achievements.map(achievement => `
                <div style="font-size: 12px; color: #4B5563; margin-left: 15px;">• ${achievement}</div>
              `).join('') : ''}
            </div>
          `).join('')}
        </div>

        <!-- Education -->
        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 16px; font-weight: bold; color: #3B82F6; margin-bottom: 15px;">EDUCATION</h3>
          ${resume.education.map(edu => `
            <div style="margin-bottom: 10px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <div style="font-size: 14px; font-weight: bold; color: #1F2937;">${edu.degree}</div>
                  <div style="font-size: 13px; color: #6B7280;">${edu.school}</div>
                </div>
                <span style="font-size: 12px; color: #6B7280;">${edu.year}</span>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Skills -->
        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 16px; font-weight: bold; color: #3B82F6; margin-bottom: 15px;">SKILLS</h3>
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            ${resume.skills.map(skill => `
              <span style="background: #EFF6FF; color: #3B82F6; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500;">${skill}</span>
            `).join('')}
          </div>
        </div>

        ${resume.projects && resume.projects.length > 0 ? `
          <!-- Projects -->
          <div style="margin-bottom: 20px;">
            <h3 style="font-size: 16px; font-weight: bold; color: #3B82F6; margin-bottom: 15px;">PROJECTS</h3>
            ${resume.projects.map(project => `
              <div style="margin-bottom: 15px;">
                <h4 style="font-size: 14px; font-weight: bold; color: #1F2937; margin: 0 0 5px 0;">${project.name}</h4>
                <p style="font-size: 13px; line-height: 1.5; color: #4B5563; margin: 0 0 8px 0;">${project.description}</p>
                <div style="font-size: 12px; color: #6B7280;">
                  <strong>Technologies:</strong> ${project.technologies.join(', ')}
                </div>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;
  }

  private static generateExecutiveTemplate(resume: EnhancedResume): string {
    // Similar structure but with more conservative styling
    return this.generateModernTemplate(resume).replace(/3B82F6/g, '374151').replace(/EFF6FF/g, 'F3F4F6');
  }

  private static generateCreativeTemplate(resume: EnhancedResume): string {
    // Similar structure but with purple/pink accents
    return this.generateModernTemplate(resume).replace(/3B82F6/g, '8B5CF6').replace(/EFF6FF/g, 'FAF5FF');
  }

  private static generateCorporateTemplate(resume: EnhancedResume): string {
    // Similar structure but with green accents
    return this.generateModernTemplate(resume).replace(/3B82F6/g, '059669').replace(/EFF6FF/g, 'F0FDF4');
  }

  /**
   * Generate preview content for template cards
   */
  static generatePreviewContent(resume: EnhancedResume | null): {
    name: string;
    title: string;
  } {
    if (!resume) {
      return {
        name: "Your Name",
        title: "Professional Title"
      };
    }

    return {
      name: resume.name,
      title: resume.title
    };
  }

  /**
   * Prepare data for PDF generation
   */
  static preparePDFData(templateId: number, resume: EnhancedResume): {
    html: string;
    filename: string;
    template: ResumeTemplate;
  } {
    const template = this.templates.find(t => t.id === templateId) || this.templates[0];
    const html = this.generateTemplateHTML(templateId, resume);
    const filename = `${resume.name.replace(/\s+/g, '_')}_Resume_${template.name.replace(/\s+/g, '_')}.pdf`;

    return {
      html,
      filename,
      template
    };
  }
}