'use client';

//import { useAuth } from "@/lib/AuthContext";

import { homePageContent } from "@/content/pages/homePageContent";
import ReactMarkdown from "react-markdown";

const HeroIdentity = () => {
  //const { user } = useAuth();

  //if (user) return null;

  return (
    <div className="relative mx-2 backdrop-blur-sm bg-slate-100/20 text-primary dark:bg-content1/20 p-4 rounded-xl text-lg self-center">
      <div className="text-justify">
        <ReactMarkdown>
        {homePageContent.hero.identity}
        </ReactMarkdown>
        </div>
    </div>
  );
};

export default HeroIdentity;
