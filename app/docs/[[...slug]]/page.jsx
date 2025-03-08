import { getAllDocs, getDocBySlug } from '@/lib/utils/docs';
import DocumentationWrapper from '@/components/docs/documentation-wrapper';

export async function generateMetadata(props) {
  // Await the params object properly
  const params = await props.params;
  const slug = params.slug;
  
  // If no slug is provided, use the first doc
  if (!slug || slug.length === 0) {
    const allDocs = getAllDocs();
    const defaultDoc = allDocs[0];

    return {
      title: `${defaultDoc.title} | Documentation`
    };
  }
  
  const doc = getDocBySlug(slug[0]);

  return {
    title: `${doc.title} | Documentation`
  };
}

export async function generateStaticParams() {
  const docs = getAllDocs();
  
  return [
    { slug: [] }, // For the index route
    ...docs.map(doc => ({
      slug: [doc.slug]
    }))
  ];
}

export default async function DocPage(props) {
  // Await the params object properly
  const params = await props.params;
  const slug = params.slug;
  
  // If no slug is provided, use the first doc
  const allDocs = getAllDocs();
  
  if (!slug || slug.length === 0) {
    const defaultDoc = allDocs[0];
    const doc = getDocBySlug(defaultDoc.slug);
    
    return (
      <DocumentationWrapper 
        currentSlug={defaultDoc.slug} 
        docContent={doc.content} 
        docsNavigation={allDocs} 
      />
    );
  }
  
  const doc = getDocBySlug(slug[0]);
  
  return (
    <DocumentationWrapper 
      currentSlug={slug[0]} 
      docContent={doc.content} 
      docsNavigation={allDocs} 
    />
  );
}