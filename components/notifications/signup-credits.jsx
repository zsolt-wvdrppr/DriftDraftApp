'use client';

import { useAuth } from "@/lib/AuthContext";
import Link from "next/link";

const SignupCreditsNotice = () => {
  const { user } = useAuth();

  //if (user) return null;

  return (
    <div className="relative flex flex-col gap-2 mx-2 backdrop-blur-sm bg-slate-100/20 border-l-4 border-brandPink/60 text-primary dark:bg-content1/20 p-4 rounded-xl text-sm max-w-xl self-center mt-6">
      <p className="font-semibold text-medium">Start with free credits, no commitment</p>
      <p className="text-justify">
        Join 500+ smart business owners who plan before they build.
        {user && (
          <>
            <span className="font-semibold">{" Start Planning "}</span>your website or landing page that actually works.
          </>
        )}
        {!user && (
          <>
            <span className="font-semibold">{" Sign Up today"}</span> and <span className="font-semibold">get 14 free credits</span> to start your website or landing page plan.
          </>
        )}
      </p>
      {!user && (
      <Link
        className="self-end px-2 py-1 mt-4 bg-brandPink hover:bg-brandPink/80 transition-all no-underline text-white hover:text-white text-lg font-semibold capitalize rounded-md animate-bounce hover:animate-none"
        href="/signup"
      >
        Sign up now
      </Link>
      )}
      {user && (
        <Link
          className="self-end px-2 py-1 mt-4 bg-brandPink hover:bg-brandPink/80 transition-all no-underline text-white hover:text-white text-lg font-semibold capitalize rounded-md animate-bounce hover:animate-none"
          href="#tool-selector"
        >
          Start Planning
        </Link>
      )}
    </div>
  );
};

export default SignupCreditsNotice;
