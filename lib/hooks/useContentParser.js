// lib/hooks/useContentParser.js
// This file provides a custom hook to parse AI-generated content into structured sections

import { useMemo } from 'react';

const useContentParser = (aiResult, promptLabels = []) => {
  const contentStructure = useMemo(() => {
    if (!aiResult) return null;

    // Known sections from our prompts
    const knownSections = [
      {
        id: 'psychology',
        title: 'Landing Page Psychology',
        labels: ['Landing Page Psychology', 'Psychology'],
        icon: 'brain',
        color: 'purple'
      },
      {
        id: 'authority',
        title: 'Authority & Trust',
        labels: ['Authority & Trust', 'Authority'],
        icon: 'shield',
        color: 'blue'
      },
      {
        id: 'urgency',
        title: 'Urgency & Optimization',
        labels: ['Urgency & Optimization', 'Urgency'],
        icon: 'zap',
        color: 'yellow'
      },
      {
        id: 'wireframe',
        title: 'Landing Page Wireframe',
        labels: ['Landing Page Wireframe', 'Wireframe'],
        icon: 'layout',
        color: 'green'
      }
    ];

    // Parse content by main headers
    const sections = parseContentSections(aiResult);
    
    // Map sections to known categories
    const categorizedSections = sections.map((section, index) => {
      const knownSection = knownSections.find(known => 
        known.labels.some(label => 
          section.title.toLowerCase().includes(label.toLowerCase())
        )
      );
      
      return {
        ...section,
        // Keep the unique ID from parsing, don't override it
        category: knownSection?.id || 'general',
        icon: knownSection?.icon || 'file',
        color: knownSection?.color || 'gray',
        // Add index to ensure uniqueness
        uniqueKey: `${section.id}-${index}`
      };
    });

    // Extract key metrics for summary cards
    const summary = extractKeyMetrics(categorizedSections);
    
    // Detect special content (wireframes, code blocks)
    const specialContent = detectSpecialContent(categorizedSections);
    
    return {
      sections: categorizedSections,
      summary,
      specialContent,
      hasWireframe: specialContent.wireframes.length > 0,
      hasCode: specialContent.codeBlocks.length > 0
    };
  }, [aiResult, promptLabels]);

  return contentStructure;
};

// Helper function to parse markdown headers
const parseContentSections = (content) => {
  if (!content) return [];
  
  const sections = [];
  const lines = content.split('\n');
  let currentSection = null;
  const usedIds = new Set(); // Track used IDs to prevent duplicates
  
  lines.forEach((line) => {
    // Main sections (# headers) - more flexible matching
    if (line.trim().startsWith('# ') || line.match(/^#+\s/)) {
      if (currentSection) {
        sections.push(currentSection);
      }
      
      // Extract header level and text
      const headerMatch = line.match(/^(#+)\s+(.+)$/);
      const headerText = headerMatch ? headerMatch[2] : line.replace(/^#+\s*/, '').trim();
      
      // Generate unique ID
      let baseId = headerText.toLowerCase().replace(/[^a-z0-9]/g, '-');
      let uniqueId = baseId;
      let counter = 1;
      
      // Make sure ID is unique
      while (usedIds.has(uniqueId)) {
        uniqueId = `${baseId}-${counter}`;
        counter++;
      }
      usedIds.add(uniqueId);
      
      currentSection = {
        id: uniqueId,
        title: headerText,
        content: '',
        subsections: []
      };
    }
    // Subsections (## headers)
    else if (line.trim().startsWith('## ') && currentSection) {
      const subheaderText = line.replace(/^##\s*/, '').trim();

      currentSection.subsections.push({
        title: subheaderText,
        content: ''
      });
    }
    // Content
    else if (currentSection) {
      if (currentSection.subsections.length > 0) {
        const lastSubsection = currentSection.subsections[currentSection.subsections.length - 1];

        lastSubsection.content += line + '\n';
      } else {
        currentSection.content += line + '\n';
      }
    }
  });
  
  if (currentSection) {
    sections.push(currentSection);
  }
  
  return sections;
};

// Extract key metrics for summary cards
const extractKeyMetrics = (sections) => {
  const metrics = {};
  
  sections.forEach(section => {
    // Look for conversion goals
    const conversionMatch = section.content.match(/conversion.*?goal[:\-]?\s*([^.\n]+)/i);

    if (conversionMatch) {
      metrics.conversionGoal = conversionMatch[1].trim();
    }
    
    // Look for target audience
    const audienceMatch = section.content.match(/target.*?audience[:\-]?\s*([^.\n]+)/i);

    if (audienceMatch) {
      metrics.targetAudience = audienceMatch[1].trim();
    }
    
    // Look for primary benefits (bullet points)
    const bulletMatches = section.content.match(/^[-*]\s+(.+)$/gm);

    if (bulletMatches && bulletMatches.length > 0) {
      metrics.keyBenefits = bulletMatches.slice(0, 3).map(match => 
        match.replace(/^[-*]\s+/, '').trim()
      );
    }
    
    // Look for psychological triggers
    const triggerWords = ['urgency', 'scarcity', 'authority', 'social proof', 'trust'];
    const triggers = triggerWords.filter(trigger => 
      section.content.toLowerCase().includes(trigger)
    );

    if (triggers.length > 0) {
      metrics.psychologyTriggers = triggers;
    }
  });
  
  return metrics;
};

// Detect special content types
const detectSpecialContent = (sections) => {
  const specialContent = {
    wireframes: [],
    codeBlocks: [],
    tables: [],
    quotes: []
  };
  
  sections.forEach(section => {
    const content = section.content;
    
    // Detect ASCII wireframes
    if (content.includes('```') && content.includes('+---')) {
      const wireframeMatches = content.match(/```[\s\S]*?\+[\-\+\|]*[\s\S]*?```/g);

      if (wireframeMatches) {
        specialContent.wireframes.push(...wireframeMatches.map(match => ({
          sectionId: section.id,
          content: match,
          type: 'ascii-wireframe'
        })));
      }
    }
    
    // Detect code blocks
    const codeMatches = content.match(/```[\s\S]*?```/g);

    if (codeMatches) {
      specialContent.codeBlocks.push(...codeMatches.map(match => ({
        sectionId: section.id,
        content: match,
        language: match.match(/```(\w+)/)?.[1] || 'text'
      })));
    }
    
    // Detect tables
    if (content.includes('|') && content.includes('---')) {
      const tableMatches = content.match(/\|.*\|[\s\S]*?\|.*\|/g);

      if (tableMatches) {
        specialContent.tables.push(...tableMatches.map(match => ({
          sectionId: section.id,
          content: match
        })));
      }
    }
  });
  
  return specialContent;
};

export default useContentParser;