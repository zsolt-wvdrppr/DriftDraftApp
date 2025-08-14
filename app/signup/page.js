import { Suspense } from "react";

import SignUp from "@/components/auth/SignUp";

const Page = () => {
  return (
    <div>
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        }
      >
        <SignUp />
      </Suspense>
    </div>
  );
};

export default Page;
