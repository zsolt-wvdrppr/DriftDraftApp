import { Suspense } from "react";

import LogIn from "@/components/auth/LogIn";

export default function LogInPage() {
  return (
    <div>
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        }
      >
        <LogIn />
      </Suspense>
    </div>
  );
}
