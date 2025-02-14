"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { Accordion, AccordionItem } from "@heroui/react";
import { IconWallet, IconSettings, IconCreditCard } from "@tabler/icons-react";
import ProfileSettings from "./profile-settings";
import logger from "@/lib/logger";
import { createOrUpdateProfile } from "@/lib/supabaseClient";


const defaultContent = (
  <div className="p-4">
    <p className="text-sm">
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla nec est ut
      dolor fermentum facilisis. Nulla facilisi. Nulla nec est ut dolor
      fermentum facilisis. Nulla facilisi.
    </p>
  </div>
);

const AccountContent = () => {

    const { user, loading } = useAuth();
    const router = useRouter();

     useEffect(() => {
        if (!loading && !user) {
          // Redirect if user is not logged in
          const redirectPath = `/login`;
    
          router.push(redirectPath);
    
          return;
        }
    
        if (!loading && user) {
          logger.debug("ensureProfileExists:", user);
          const ensureProfileExists = async () => {
            await createOrUpdateProfile();
          };
    
          ensureProfileExists();
        }
      }, [loading, user, router]);
 
  return (
    <div className="max-w-screen-xl p-4 flex">
      <Accordion>
        <AccordionItem
          key="profile"
          aria-label="Profile Settings"
          indicator={<IconSettings className="rotate-45" />}
          subtitle="Press to expand"
          title={<h2 className="text-xl font-semibold">{"Profile Settings"}</h2>}
        >
          <ProfileSettings />
        </AccordionItem>
        <AccordionItem
          key="credits"
          aria-label="Subscription & Top Up"
          indicator={<IconWallet className="rotate-45" />}
          subtitle="Press to expand"
          title={<h2 className="text-xl font-semibold">{"Subscription & Top Up"}</h2>}
        >
          {defaultContent}
        </AccordionItem>
        <AccordionItem
          key="payment"
          aria-label="Payment Methods"
          indicator={<IconCreditCard className="rotate-45" />}
          subtitle="Press to expand"
          title={<h2 className="text-xl font-semibold">{"Payment Methods"}</h2>}
        >
          {defaultContent}
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default AccountContent;
