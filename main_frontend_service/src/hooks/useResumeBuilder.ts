// Custom hook for resume builder functionality

import { useState, useCallback } from 'react';
import { ResumeEnhancementService } from '@/lib/resume/openai-service';
import { ResumeParser } from '@/lib/resume/parser';
import { EnhancedResume, ResumeEnhancementResult } from '@/lib/resume/types';

interface UseResumeBuilderProps {
  openaiApiKey: string;
  onProgress?: (step: string) => void;
  onError?: (error: string) => void;
}

export function useResumeBuilder({ 
  openaiApiKey, 
  onProgress, 
  onError 
}: UseResumeBuilderProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedText, setExtractedText] = useState<string>('');
  const [enhancedResume, setEnhancedResume] = useState<EnhancedResume | null>(null);
  const [enhancedResumes, setEnhancedResumes] = useState<EnhancedResume[]>([]);
  const [enhancementResult, setEnhancementResult] = useState<ResumeEnhancementResult | null>(null);
  const [currentStep, setCurrentStep] = useState<string>('');

  const enhanceResume = useCallback(async (userData: any) => {
    try {
      setIsProcessing(true);
      setCurrentStep('Fetching resume context from database...');
      onProgress?.('Fetching resume context from database...');

      // Step 1: Use resume context from database (no PDF extraction needed)
      let extractedText: string;
      
      if (userData.resumeContext) {
        console.log('✅ Using resume context from database:');
        console.log('=' .repeat(60));
        console.log(userData.resumeContext);
        console.log('=' .repeat(60));
        console.log(`📊 Context length: ${userData.resumeContext.length} characters`);
        
        extractedText = userData.resumeContext;
      } else {
        console.log('⚠️ No resume context in database, using fallback data');
        // Use basic user info to create a simple context
        extractedText = `
          Name: ${userData.full_name || 'Professional'}
          Education: ${userData.education_level || 'Bachelor\'s Degree'}
          Department: ${userData.department || 'Technology'}
          Experience Level: ${userData.experience_level || 'Mid-level'}
          Career Track: ${userData.preferred_career_track || 'Professional'}
        `;
      }
      
      setExtractedText(extractedText);

      // Skip validation since we're using pre-processed database context
      console.log('📝 Proceeding with OpenAI enhancement...');

      setCurrentStep('Initializing AI enhancement...');
      onProgress?.('Initializing AI enhancement...');

      // Step 3: Generate 4 different resume variations with OpenAI
      const enhancementService = new ResumeEnhancementService(openaiApiKey);
      
      const { variations, improvements } = await enhancementService.generateMultipleResumeVariations(
        extractedText,
        (step) => {
          setCurrentStep(step);
          onProgress?.(step);
        }
      );

      // Store all 4 variations
      setEnhancedResumes(variations);
      
      let result: ResumeEnhancementResult;
      
      // Set the first variation as the default enhanced resume
      if (variations.length > 0) {
        setEnhancedResume(variations[0]);
        
        // Create a result object with actual improvements identified by AI
        result = {
          original: extractedText,
          enhanced: variations[0],
          improvements: improvements || [
            "Added quantifiable metrics to demonstrate impact",
            "Strengthened with action-oriented professional language",
            "Optimized for ATS with industry-specific keywords",
            "Enhanced professional summary to highlight unique value"
          ],
          score: 85
        };
        setEnhancementResult(result);
      } else {
        throw new Error('Failed to generate resume variations');
      }
      
      setCurrentStep('Generated 4 unique resume variations!');
      onProgress?.('Generated 4 unique resume variations!');

      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Resume enhancement failed:', error);
      onError?.(errorMessage);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [openaiApiKey, onProgress, onError]);

  const resetBuilder = useCallback(() => {
    setExtractedText('');
    setEnhancedResume(null);
    setEnhancementResult(null);
    setCurrentStep('');
    setIsProcessing(false);
  }, []);

  const getEnhancementSummary = useCallback(() => {
    if (!enhancementResult) return null;

    return {
      score: enhancementResult.score,
      improvements: enhancementResult.improvements,
      originalLength: enhancementResult.original.length,
      enhancedSections: {
        hasExperience: enhancementResult.enhanced.experience.length > 0,
        hasEducation: enhancementResult.enhanced.education.length > 0,
        skillsCount: enhancementResult.enhanced.skills.length,
        projectsCount: enhancementResult.enhanced.projects?.length || 0
      }
    };
  }, [enhancementResult]);

  return {
    // State
    isProcessing,
    extractedText,
    enhancedResume,
    enhancedResumes,
    enhancementResult,
    currentStep,

    // Actions
    enhanceResume,
    resetBuilder,

    // Computed
    getEnhancementSummary,
    isEnhanced: !!enhancedResume,
    hasExtractedText: !!extractedText,
    hasMultipleVariations: enhancedResumes.length > 0
  };
}