// Resume parsing utilities

import { UserResumeData } from '@/app/(candidate)/candidate-dashboard/ai-resume-builder/page';

export class ResumeParser {
  /**
   * Extract text from PDF using Google Gemini API
   */
  static async extractTextFromPDFWithGemini(pdfUrl: string, geminiApiKey: string): Promise<string> {
    try {
      console.log('🔄 Starting Gemini PDF text extraction from:', pdfUrl);
      
      // Fetch PDF and convert to base64
      const response = await fetch(pdfUrl);
      const pdfArrayBuffer = await response.arrayBuffer();
      const base64Data = btoa(String.fromCharCode(...new Uint8Array(pdfArrayBuffer)));
      
      // Use Gemini Pro Vision API
      const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                text: "Extract ALL text from this PDF document exactly as it appears. Preserve the original formatting, line breaks, and structure. Return only the raw text content without any modifications or summaries."
              },
              {
                inline_data: {
                  mime_type: "application/pdf",
                  data: base64Data
                }
              }
            ]
          }],
          generationConfig: {
            temperature: 0,
            maxOutputTokens: 8192
          }
        })
      });

      if (!geminiResponse.ok) {
        throw new Error(`Gemini API request failed: ${geminiResponse.statusText}`);
      }

      const data = await geminiResponse.json();
      const extractedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

      console.log('📄 GEMINI EXTRACTED TEXT:');
      console.log('=' .repeat(60));
      console.log(extractedText);
      console.log('=' .repeat(60));
      console.log(`📊 Total characters extracted: ${extractedText.length}`);

      return extractedText;

    } catch (error) {
      console.error('❌ Gemini PDF extraction failed:', error);
      throw error;
    }
  }

  /**
   * Extract text from PDF using PDFShift API (most reliable for text extraction)
   */
  static async extractTextFromPDFWithPDFShift(pdfUrl: string): Promise<string> {
    try {
      console.log('🔄 Starting PDFShift PDF text extraction from:', pdfUrl);
      
      // Use PDFShift's free API for PDF to text conversion
      const response = await fetch('https://api.pdfshift.io/v3/convert/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source: pdfUrl,
          format: 'text'
        })
      });

      if (!response.ok) {
        throw new Error(`PDFShift API request failed: ${response.statusText}`);
      }

      const extractedText = await response.text();

      console.log('📄 PDFSHIFT EXTRACTED TEXT:');
      console.log('=' .repeat(60));
      console.log(extractedText);
      console.log('=' .repeat(60));
      console.log(`📊 Total characters extracted: ${extractedText.length}`);

      return extractedText;

    } catch (error) {
      console.error('❌ PDFShift extraction failed:', error);
      throw error;
    }
  }

  /**
   * Extract text from PDF using Mozilla PDF.js with better parsing
   */
  static async extractTextFromPDFWithMozilla(pdfUrl: string): Promise<string> {
    try {
      console.log('🔄 Starting Mozilla PDF.js extraction from:', pdfUrl);
      
      // Fetch PDF as blob
      const response = await fetch(pdfUrl);
      const pdfBlob = await response.blob();
      const pdfArrayBuffer = await pdfBlob.arrayBuffer();
      
      // Use Mozilla's PDF.js
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
      
      const pdf = await pdfjsLib.getDocument({ data: pdfArrayBuffer }).promise;
      console.log(`📄 PDF loaded. Pages: ${pdf.numPages}`);
      
      let fullText = '';
      
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        // Better text extraction with positioning
        const textItems = textContent.items
          .filter((item: any) => item.str && item.str.trim())
          .sort((a: any, b: any) => {
            // Sort by Y position (top to bottom), then X position (left to right)
            const yDiff = b.transform[5] - a.transform[5];
            if (Math.abs(yDiff) > 5) return yDiff > 0 ? 1 : -1;
            return a.transform[4] - b.transform[4];
          });

        let pageText = '';
        let lastY = null;
        
        for (const item of textItems) {
          const y = item.transform[5];
          
          // Add newline if we're on a new line
          if (lastY !== null && Math.abs(y - lastY) > 5) {
            pageText += '\n';
          }
          
          // Add space if needed
          if (pageText && !pageText.endsWith('\n') && !pageText.endsWith(' ')) {
            pageText += ' ';
          }
          
          pageText += item.str;
          lastY = y;
        }
        
        fullText += pageText + '\n\n';
      }

      console.log('📄 MOZILLA EXTRACTED TEXT:');
      console.log('=' .repeat(60));
      console.log(fullText);
      console.log('=' .repeat(60));
      
      return fullText.trim();

    } catch (error) {
      console.error('❌ Mozilla PDF extraction failed:', error);
      throw error;
    }
  }

  /**
   * Extract text from PDF using OpenAI Vision API
   */
  static async extractTextFromPDFWithOpenAI(pdfUrl: string, openaiApiKey: string): Promise<string> {
    try {
      console.log('🔄 Starting OpenAI PDF text extraction from:', pdfUrl);
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Extract ALL text from this resume PDF. Return the exact text content as it appears in the document, preserving formatting, line breaks, and structure. Do not summarize or modify the content - just extract the raw text exactly as written.'
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: pdfUrl
                  }
                }
              ]
            }
          ],
          max_tokens: 4000,
          temperature: 0
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      const extractedText = data.choices[0]?.message?.content || '';

      // Log extracted text
      console.log('📄 OPENAI EXTRACTED PDF TEXT:');
      console.log('=' .repeat(60));
      console.log(extractedText);
      console.log('=' .repeat(60));
      console.log(`📊 Total characters extracted: ${extractedText.length}`);
      console.log(`📄 Total lines: ${extractedText.split('\n').length}`);

      return extractedText;

    } catch (error) {
      console.error('❌ OpenAI PDF extraction failed:', error);
      throw new Error(`Failed to extract text from PDF with OpenAI: ${error}`);
    }
  }

  /**
   * Extract text from PDF URL using PDF.js (fallback method)
   */
  static async extractTextFromPDF(pdfUrl: string): Promise<string> {
    try {
      console.log('🔄 Starting PDF extraction from:', pdfUrl);
      
      // Use fetch to get PDF as ArrayBuffer for cross-origin access
      const response = await fetch(pdfUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch PDF: ${response.statusText}`);
      }
      
      const pdfArrayBuffer = await response.arrayBuffer();
      
      // Dynamically import PDF.js to avoid SSR issues
      const pdfjsLib = await import('pdfjs-dist');
      
      // Set worker source for PDF.js
      if (typeof window !== 'undefined') {
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
      }
      
      // Load PDF from ArrayBuffer
      const loadingTask = pdfjsLib.getDocument({ data: pdfArrayBuffer });
      const pdf = await loadingTask.promise;
      
      console.log(`📄 PDF loaded successfully. Pages: ${pdf.numPages}`);
      
      let extractedText = '';
      
      // Extract text from all pages with better formatting
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        // Sort items by position for better text flow
        const items = textContent.items.sort((a: any, b: any) => {
          if (Math.abs(a.transform[5] - b.transform[5]) > 5) {
            return b.transform[5] - a.transform[5]; // Sort by Y position (top to bottom)
          }
          return a.transform[4] - b.transform[4]; // Sort by X position (left to right)
        });
        
        let pageText = '';
        let lastY = null;
        
        for (const item of items) {
          const currentY = item.transform[5];
          
          // Add line break if we've moved to a new line
          if (lastY !== null && Math.abs(currentY - lastY) > 5) {
            pageText += '\n';
          }
          
          // Add space if needed (except at start of line)
          if (pageText && !pageText.endsWith('\n') && !pageText.endsWith(' ')) {
            pageText += ' ';
          }
          
          pageText += item.str;
          lastY = currentY;
        }
        
        extractedText += pageText + '\n\n';
        console.log(`✅ Page ${pageNum} extracted: ${pageText.length} characters`);
        console.log(`📝 Page ${pageNum} preview:`, pageText.substring(0, 200) + '...');
      }
      
      // Log RAW extracted text (before cleaning)
      console.log('📄 RAW EXTRACTED PDF TEXT:');
      console.log('=' .repeat(60));
      console.log(extractedText);
      console.log('=' .repeat(60));
      console.log(`📊 Raw characters extracted: ${extractedText.length}`);
      console.log(`📄 Raw lines: ${extractedText.split('\n').length}`);
      
      const cleanedText = this.cleanResumeText(extractedText);
      
      // Log cleaned text
      console.log('\n🧹 CLEANED PDF TEXT:');
      console.log('=' .repeat(60));
      console.log(cleanedText);
      console.log('=' .repeat(60));
      console.log(`📊 Cleaned characters: ${cleanedText.length}`);
      console.log(`📄 Cleaned lines: ${cleanedText.split('\n').length}`);
      
      return cleanedText;
      
    } catch (error) {
      console.error('❌ PDF extraction failed:', error);
      throw new Error(`Failed to extract text from PDF: ${error}`);
    }
  }
  /**
   * Generate mock extracted text from user data for demo purposes
   */
  static generateMockExtractedText(userData: UserResumeData): string {
    const email = userData.full_name?.toLowerCase().replace(/\s+/g, '.') + '@email.com';
    
    const extractedText = `
${userData.full_name || 'Professional Name'}
${userData.preferred_career_track || userData.department || 'Professional Title'}
Email: ${email}
Phone: +1 (555) 123-4567

PROFESSIONAL SUMMARY
Experienced ${userData.experience_level?.toLowerCase() || 'professional'} with strong background in ${userData.department || 'technology'}. 
Proven track record of delivering high-quality solutions and working effectively in team environments.
Passionate about continuous learning and professional development in ${userData.preferred_career_track || 'the industry'}.

EXPERIENCE
Senior ${userData.department || 'Professional'} - Tech Solutions Inc. (2021 - Present)
• Led development of innovative solutions using modern technologies and best practices
• Collaborated with cross-functional teams to deliver projects on time and within budget
• Mentored junior team members and conducted technical reviews
• Improved operational efficiency by 40% through process optimization and automation

${userData.department || 'Professional'} - Digital Innovations (2019 - 2021)  
• Developed and maintained critical business applications and systems
• Implemented automated testing strategies and quality assurance processes
• Participated in agile development processes and sprint planning
• Contributed to architectural decisions and technical documentation

EDUCATION
${userData.education_level || 'Bachelor of Science in ' + (userData.department || 'Technology')}
University of Technology - 2019
Relevant Coursework: Advanced topics in ${userData.department || 'technology'} and professional development

SKILLS
Technical: JavaScript, Python, React, Node.js, SQL, AWS, Docker, Git
Professional: Team Leadership, Project Management, Agile Development, Problem Solving
Industry: ${userData.department || 'Technology'} Best Practices, Strategic Planning, Process Improvement
    `.trim();

    // Clear console logging of extracted PDF text
    console.log('📄 EXTRACTED PDF TEXT:');
    console.log('=' .repeat(60));
    console.log(extractedText);
    console.log('=' .repeat(60));
    console.log(`📊 Total characters extracted: ${extractedText.length}`);
    console.log(`📄 Total lines: ${extractedText.split('\n').length}`);
    
    return extractedText;
  }

  /**
   * Extract basic information from raw resume text
   */
  static extractBasicInfo(text: string): {
    name?: string;
    email?: string;
    phone?: string;
    title?: string;
  } {
    const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
    
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    const phoneRegex = /(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/;
    
    const email = text.match(emailRegex)?.[0];
    const phone = text.match(phoneRegex)?.[0];
    
    // Assume first non-empty line is name, second might be title
    const name = lines[0];
    const title = lines.length > 1 ? lines[1] : undefined;
    
    return {
      name: name || undefined,
      email: email || undefined,
      phone: phone || undefined,
      title: title || undefined
    };
  }

  /**
   * Validate extracted resume text
   */
  static validateResumeText(text: string): {
    isValid: boolean;
    errors: string[];
    score: number;
  } {
    const errors: string[] = [];
    let score = 0;

    if (!text || text.trim().length < 50) {
      errors.push('Resume text is too short');
    } else {
      score += 20;
    }

    // Check for common resume sections
    const sections = ['experience', 'education', 'skills'];
    sections.forEach(section => {
      if (text.toLowerCase().includes(section)) {
        score += 20;
      } else {
        errors.push(`Missing ${section} section`);
      }
    });

    // Check for contact information
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    if (emailRegex.test(text)) {
      score += 20;
    } else {
      errors.push('No email address found');
    }

    return {
      isValid: errors.length === 0,
      errors,
      score: Math.min(score, 100)
    };
  }

  /**
   * Clean and format resume text - minimal cleaning to preserve original structure
   */
  static cleanResumeText(text: string): string {
    return text
      .replace(/\n{3,}/g, '\n\n') // Replace multiple line breaks with double
      .replace(/[ \t]+/g, ' ') // Replace multiple spaces/tabs with single space
      .trim();
  }
}