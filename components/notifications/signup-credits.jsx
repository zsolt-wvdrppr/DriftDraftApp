'use client';

import { useAuth } from "@/lib/AuthContext";

const SignupCreditsNotice = () => {
  const { user } = useAuth();

  if (user) return null;

  return (
    <div className="relative mx-2 backdrop-blur-sm bg-slate-100/20 border-l-4 border-accent/60 text-primary dark:bg-content1/20 p-4 rounded-xl text-sm max-w-3xl self-center mt-6">
      <p className="font-semibold">Sign up now and get 14 free credits</p>
      <p>
        {`Join today and receive 14 complimentary credits to get started. You can use these credits to create a website or landing page plan.`}
      </p>
    </div>
  );
};

export default SignupCreditsNotice;
