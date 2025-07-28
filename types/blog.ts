export interface BlogPost {
  id: string;
  title: string;
  content: string;
  publishDate: string;
  featuredImage: {
    id: string;
    alt: string;
    src: string;
    mediaId: string;
  };
  tags: Array<{
    type: string;
  }>;
  categories: Array<{
    type: string;
  }>;
  publishSchedule: null | string; // or Date if it's a date
}

export interface BlogLayoutProps {
  posts: BlogPost[];
  sidebarPosition?: 'left' | 'right';
  showMobileToggle?: boolean;
  children: React.ReactNode;
}