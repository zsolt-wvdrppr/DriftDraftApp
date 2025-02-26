import { Suspense } from "react";

import SignUp from "@/components/auth/SignUp";

const Page = () => {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <SignUp />
      </Suspense>
    </div>
  );
};

export default Page;
