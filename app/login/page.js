import { Suspense } from "react";

import LogIn from "@/components/auth/LogIn";


export default function LogInPage() {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
      <LogIn />
      </Suspense>
    </div>
  );
}
