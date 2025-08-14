import { Suspense } from "react";

import Activities from "@/components/activities/Activities";

const Page = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold m-4 text-primary">My Activities</h1>
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        }
      >
        <Activities />
      </Suspense>
    </div>
  );
};

export default Page;
