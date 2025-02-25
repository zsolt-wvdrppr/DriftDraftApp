"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { Accordion, AccordionItem } from "@heroui/react";
import { IconWallet, IconSettings, IconCreditCard, IconEyeglassFilled } from "@tabler/icons-react";
import ProfileSettings from "./profile-settings";
import SubscriptionAndTopup from "./subscription-and-topup";
import PaymentMethod from "./payment_method";
import logger from "@/lib/logger";
import StripeProvider from "@/lib/hooks/StripeProvider";
import { useReferralName } from "../../lib/hooks/useReferralName";
import AgentPanel from "../agent-panel/Main";


const AccountContent = () => {
  const { user, loading } = useAuth();
  const userId = user?.id;
  const router = useRouter();
  const { referralName } = useReferralName(userId);
  const [newReferralName, setNewReferralName] = useState(referralName);

  useEffect(() => {
    if (!loading && !user) {
      // Redirect if user is not logged in
      const redirectPath = `/login`;

      router.push(redirectPath);

      return;
    }

  }, [loading, user, router]);



  return (
    <StripeProvider>
      <div className="max-w-screen-xl p-4 flex">
        <Accordion>
          <AccordionItem
            key="profile"
            aria-label="Profile Settings"
            indicator={<IconSettings className="rotate-45 text-primary" />}
            subtitle="Press to expand"
            className="overflow-hidden"
            title={
              <h2 className="text-xl font-semibold">{"Profile Settings"}</h2>
            }
          >
            <ProfileSettings />
          </AccordionItem>
          <AccordionItem
            key="credits"
            aria-label="Subscription & Top Up"
            indicator={<IconWallet className="rotate-45 text-primary" />}
            subtitle="Press to expand"
            className="overflow-hidden"
            title={
              <h2 className="text-xl font-semibold">
                {"Subscription & Top Up"}
              </h2>
            }
          >
            <SubscriptionAndTopup />
          </AccordionItem>
          <AccordionItem
            key="payment"
            aria-label="Payment Method"
            indicator={<IconCreditCard className="rotate-45 text-primary" />}
            subtitle="Press to expand"
            title={
              <h2 className="text-xl font-semibold">{"Payment Method"}</h2>
            }
          >
            <PaymentMethod
              onSuccess={() => console.log("Payment method added!")}
            />
            <PaymentMethodDescription />
          </AccordionItem>
          {referralName && (
          <AccordionItem
            key="agent-panel"
            aria-label="Agent panel"
            indicator={<IconEyeglassFilled className="rotate-45 text-primary" />}
            subtitle="Press to expand"
            title={
              <h2 className="text-xl font-semibold">{"Agent Panel"}</h2>
            }
          >
            <AgentPanel />
          </AccordionItem>
          )}
        </Accordion>
      </div>
    </StripeProvider>
  );
};

export default AccountContent;

export const PaymentMethodDescription = () => {
  return (
    <div className="py-14">
      <p className="text-gray-700">
        This section allows you to securely add or update your payment method for future transactions. Your card details 
        are processed by <strong>Stripe</strong>, ensuring safe and encrypted payments.
      </p>

      <h3 className="text-lg font-semibold mt-4">💳 How It Works:</h3>
      <ul className="list-disc pl-5 text-gray-700">
        <li><strong>Add a Card</strong> – Enter your card details and save them for future use.</li>
        <li><strong>Automatic Payments</strong> – Your saved card will be used for subscriptions and purchases.</li>
        <li><strong>Update Anytime</strong> – You can update or replace your payment method whenever needed.</li>
      </ul>

      <h3 className="text-lg font-semibold mt-4">🔐 Security & Privacy</h3>
      <p className="text-gray-700">
        We <strong>never store</strong> your card details directly. Payments are handled securely by Stripe, a trusted payment processor.
      </p>

      <p className="text-gray-700 mt-4">If you have any questions, feel free to contact support! 🚀</p>
    </div>
  );
};

