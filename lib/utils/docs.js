import fs from 'fs';
import path from 'path';

const docsDirectory = path.join(process.cwd(), 'data/docs');

// Helper function to format title
function formatTitle(title) {
  // Replace dashes with spaces
  const withSpaces = title.replace(/-/g, ' ');
  
  // Capitalize first letter of each word
  return withSpaces
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function getDocBySlug(slug) {
  try {
    const fullPath = path.join(docsDirectory, `${slug}.md`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    
    // Get title from first heading or format the slug
    const titleFromHeading = fileContents.match(/# (.*)/)?.[1];
    const title = titleFromHeading || formatTitle(slug);
    
    return {
      slug,
      content: fileContents,
      title
    };
  } catch (error) {
    console.error(`Error reading doc file: ${slug}`, error);

    return {
      slug,
      content: '# Not Found\n\nThe requested document could not be found.',
      title: 'Not Found'
    };
  }
}

export function getAllDocs() {
  try {
    const fileNames = fs.readdirSync(docsDirectory);
    
    const allDocs = fileNames
      .filter(fileName => fileName.endsWith('.md'))
      .map(fileName => {
        const slug = fileName.replace(/\.md$/, '');
        const fullPath = path.join(docsDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        
        // Get title from first heading or format the slug
        const titleFromHeading = fileContents.match(/# (.*)/)?.[1];
        const title = titleFromHeading || formatTitle(slug);
        
        // Get order from filename if it starts with a number
        const order = fileName.match(/^(\d+)-/)?.[1] 
          ? parseInt(fileName.match(/^(\d+)-/)[1], 10) 
          : 999;
        
        return {
          slug,
          title,
          order
        };
      });
      
    // Sort by order
    return allDocs.sort((a, b) => a.order - b.order);
  } catch (error) {
    console.error("Error reading docs directory:", error);

    return [];
  }
}