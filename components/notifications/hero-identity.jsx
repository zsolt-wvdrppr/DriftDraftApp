'use client';

import { useAuth } from "@/lib/AuthContext";

const HeroIdentity = () => {
  const { user } = useAuth();

  if (user) return null;

  return (
    <div className="relative mx-2 backdrop-blur-sm bg-slate-100/20 border-l-4 border-accent/60 text-primary dark:bg-content1/20 p-4 rounded-xl text-sm max-w-xl self-center mt-6">
      <p className="font-semibold text-justify">For business owners who know their website should convert, but don't know why it doesn't.</p>
    </div>
  );
};

export default HeroIdentity;
