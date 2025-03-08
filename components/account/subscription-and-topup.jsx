import { useState, useEffect } from "react";
import { useSessionContext } from "@/lib/SessionProvider";
import { Button, Card, useDisclosure, Spinner, Link } from "@heroui/react";
import { useStripe, useElements } from "@stripe/react-stripe-js";
import { useMotionValue, useSpring } from "framer-motion";

import logger from "@/lib/logger";
import PromocodeInput from "./PromocodeInput";
import OneOffProductsModal from "./OneOffProductsModal";
import RecurringProductsModal from "./RecurringProductsModal";
import CancelSubscriptionModal from "./CancelSubscriptionModal";
import { formatDateToLocal } from "@/lib/utils/utils";
import useCancelSubscription from "@/lib/hooks/useCancelSubscription";
import { useAuth } from "@/lib/AuthContext";
import { IconReload } from "@tabler/icons-react";
import { Tooltip } from "react-tooltip";
import { usePaymentMethod } from "@/lib/hooks/usePaymentMethod";
import InvoiceList from "./InvoiceList";
import { IconHelp, IconListDetails } from "@tabler/icons-react";
import TransferCredit from "./transfer-credit";

// AnimatedNumber component to animate numeric changes
const AnimatedNumber = ({ value }) => {
  if (typeof value !== "number") return null;
  const motionValue = useMotionValue(value);
  const springValue = useSpring(motionValue, { stiffness: 100, damping: 20 });
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    // When the value changes, update the motion value
    // debug log
    logger.debug("Value changed", value);

    motionValue.set(value);
  }, [value, motionValue]);

  useEffect(() => {
    // Subscribe to changes on the spring and update the display value (rounded)
    return springValue.on("change", (latest) => {
      setDisplayValue(Math.floor(latest));
    });
  }, [springValue]);

  return <span>{displayValue}</span>;
};

const SubscriptionAndTopup = () => {
  // Assumes that your session context now includes a refreshPaidServicesData function
  const { refreshPaidServicesData, paidServicesData: services } =
    useSessionContext();
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuth();
  const userId = user?.id;
  const { paymentMethod, loading: paymentMethodLoading } = usePaymentMethod(
    userId,
    stripe,
    elements
  );

  const {
    isOpen: isPlanOpen,
    onOpen: onPlanOpen,
    onClose: onPlanClose,
  } = useDisclosure();
  const {
    isOpen: isTopupOpen,
    onOpen: onTopupOpen,
    onClose: onTopupClose,
  } = useDisclosure();
  const {
    isOpen: isCancelOpen,
    onOpen: onCancelOpen,
    onClose: onCancelClose,
  } = useDisclosure();

  // Callback to handle promo code application
  const handlePromoApplied = (data) => {
    logger.info("Promo code applied, refreshing credits", data);
    // Refresh the credits from the session context so that the new balances are fetched
    refreshPaidServicesData();
  };

  const {
    cancelSubscription,
    loading: cancellationLoading,
    error: cancellationError,
  } = useCancelSubscription(userId);

  const now = new Date().getTime() / 1000;
  const expiryDate = new Date(services?.planExpiresAt).getTime() / 1000;

  const tierColor = {
    Pro: "bg-highlightPurple",
    Advanced: "bg-highlightOrange",
    Starter: "bg-highlightBlue",
  };

  const handleCancellation = async () => {
    try {
      await cancelSubscription();
      refreshPaidServicesData();
      onCancelClose();
    } catch (error) {
      logger.error("Failed to cancel subscription", error);
    }
  };

  const totalCredits =
    (services?.allowanceCredits ?? 0) +
    (services?.topUpCredits ?? 0) +
    (services?.promoCredits ?? 0);

  return (
    <div className="pt-4 pb-8 mx-auto flex flex-col w-full gap-y-4 items-center overflow-hidden">
      {/* paymentMethodLoading spinner*/}
      {paymentMethodLoading && (
        <Spinner color="primary" size="sm" className="justify-self-center" />
      )}
      {!paymentMethodLoading && !paymentMethod && (
        <p className="text-danger text-center mb-4">
          {`Add a payment method first to subscribe to a plan or top-up credits.`}
        </p>
      )}
      <div className="flex flex-wrap gap-4 justify-stretch mx-auto max-w-screen-md">
        <div className="w-full md:w-auto flex-grow md:min-w-64">
          <Card className="p-4 mb-4 flex-col gap-4 relative h-full justify-between border">
            <div className="relative w-fit">
              <h3 className="text-lg font-semibold text-primary">
                Subscription Details
                <IconHelp
                  id="subscription-title"
                  size={16}
                  className="absolute -top-1 -right-5"
                />
              </h3>
            </div>
            {/* refreshPaidServicesData button*/}
            <Button
              onPress={() => refreshPaidServicesData()}
              className="absolute top-0 right-0 min-w-max"
              isDisabled={services?.loading || !paymentMethod}
            >
              <IconReload size={24} className="text-accent" />
            </Button>
            {services?.hasActiveSubscription ? (
              <>
                <p className="flex items-end justify-between w-full text-primary">
                  <span>Active plan:</span>
                  <span
                    className={`${tierColor[services.tier]} pt-1 pb-0.5 px-2 rounded-md text-white font-bold shadow-sm drop-shadow-md`}
                  >
                    {services.tier}
                  </span>
                </p>
                <p className="flex items-center justify-between w-full text-primary gap-10">
                  <span className="">
                    {services?.planExpiresAt && expiryDate > now
                      ? "Cancels:"
                      : "Renewal:"}
                  </span>
                  <span className="text-sm text-right font-semibold text-default-500 drop-shadow-sm">
                    {formatDateToLocal(
                      services?.planRenewsAt || services?.planExpiresAt
                    )}
                  </span>
                </p>
                <p className="flex items-center justify-between w-full text-primary gap-10">
                  <span>Started:</span>
                  <span className="text-sm text-right font-semibold text-default-500 drop-shadow-sm">
                    {formatDateToLocal(services?.planStartsAt)}
                  </span>
                </p>
              </>
            ) : (
              <p className="text-lg text-center">No active subscription</p>
            )}
            <div id="manage-button" className="">
              <Button
                onPress={onPlanOpen}
                className="bg-primary text-white font-semibold w-full"
                isDisabled={
                  (services?.planExpiresAt && expiryDate > now) ||
                  !paymentMethod ||
                  paymentMethodLoading
                }
              >
                {services?.hasActiveSubscription
                  ? "Change Subscription"
                  : "Select Plan"}
              </Button>
            </div>
            {services?.hasActiveSubscription && !services.planExpiresAt && (
              <Button
                onPress={onCancelOpen}
                className="text-danger font-semibold min-w-max w-fit h-fit self-center p-0 m-0"
              >
                Cancel Plan
              </Button>
            )}
            {/* cancelSubscription errors*/}
            {cancellationError && (
              <p className="text-red-500">{cancellationError}</p>
            )}
          </Card>
        </div>
        <div className="flex flex-col gap-y-4 flex-grow items-stretch justify-between w-full md:w-auto">
          <Card className="p-4 flex flex-col gap-y-4 items-center h-full justify-between border">
            <div className="flex flex-col gap-4 items-center justify-center h-full w-full">
              <div className="text-lg flex gap-x-10 w-full justify-evenly text-primary">
                <span className="relative font-semibold">
                  Credits:
                  <IconHelp
                    id="total-credits"
                    size={16}
                    className="absolute -top-1 -right-5"
                  />
                </span>
                <span className="font-bold text-highlightPurple relative">
                  {totalCredits !== null ? (
                    <>
                      <AnimatedNumber value={totalCredits} />
                      <IconListDetails
                        id="credit-breakdown"
                        size={16}
                        className="absolute -top-1 -right-5"
                      />
                    </>
                  ) : (
                    <Spinner
                      color="primary"
                      size="sm"
                      className="justify-self-end"
                    />
                  )}
                </span>
              </div>
            </div>
            <div id="topup-button" className="w-full flex">
              <Button
                onPress={onTopupOpen}
                className="bg-lime-500 text-white w-full font-semibold mx-auto"
                isDisabled={!paymentMethod || paymentMethodLoading}
              >
                Top-Up Now
              </Button>
            </div>
          </Card>

          {/* Pass the promo code applied callback to the PromocodeInput component */}
          <Card className="p-2 border min-h-[75px]">
            <PromocodeInput onPromoCodeApplied={handlePromoApplied} />
          </Card>
        </div>
        <Card className="p-4 border flex w-full">
          <TransferCredit
            onSuccess={refreshPaidServicesData}
            isDisabled={
              (!paymentMethodLoading &&
              !paymentMethod &&
              services?.topUpCredits < 0)
            }
          />
        </Card>
        <Card className="p-4 border flex w-full">
          <InvoiceList userId={userId} />
        </Card>
      </div>

      <RecurringProductsModal
        isOpen={isPlanOpen}
        onClose={onPlanClose}
        onSuccess={refreshPaidServicesData}
      />

      <OneOffProductsModal
        isOpen={isTopupOpen}
        onClose={onTopupClose}
        onSuccess={refreshPaidServicesData}
      />

      <CancelSubscriptionModal
        isOpen={isCancelOpen}
        onClose={onCancelClose}
        onConfirm={handleCancellation}
        loading={cancellationLoading}
      />

      <Tooltip
        anchorSelect="#credit-breakdown"
        place="top"
        className="break-words max-w-60 flex flex-col gap-2"
      >
        {`Breakdown of your total credits:`}
        <span className="flex gap-2 justify-between">
          <span>Allowance credits:</span>
          <span>{services.allowanceCredits}</span>
        </span>
        <span className="flex gap-2 justify-between">
          <span>Top-up credits:</span>
          <span>{services.topUpCredits}</span>
        </span>
        <span className="flex gap-2 justify-between">
          <span>Promo credits:</span>
          <span>{services.promoCredits}</span>
        </span>
      </Tooltip>
      <Tooltip
        anchorSelect="#subscription-title"
        place="top"
        className="break-words max-w-60 text-justify"
      >
        {`Subscribing to a plan means you'll receive a set amount of allowance credits each month upon renewal, but unused credits do not carry over to the next month.`}
      </Tooltip>
      <Tooltip
        anchorSelect="#total-credits"
        place="top"
        className="break-words max-w-60"
      >
        {`Total credits are the sum of your non-transferable allowance credits,`}
        <br />
        <br />
        {`top-up credits which are purchased separately,`}
        <br />
        <br />
        {`and promo credits which are non-transferable.`}
      </Tooltip>

      <Tooltip
        anchorSelect="#manage-button"
        place="top"
        className="break-words max-w-60"
      >
        {services?.planExpiresAt && expiryDate > now && (
          <span>
            {`You can only change your subscription after the current billing
                cycle ends, because you've cancelled it.`}
          </span>
        )}
        {!paymentMethod && !paymentMethodLoading ? (
          <span>
            {`Add or update your payment method to subscribe to a plan.`}
          </span>
        ) : (
          <span>{`Select a plan or change your current subscription.`}</span>
        )}
      </Tooltip>

      <Tooltip
        anchorSelect="#topup-button"
        place="top"
        className="break-words max-w-60 text-justify"
      >
        {`Add or update your payment method to top-up credits.`}
      </Tooltip>
    </div>
  );
};

export default SubscriptionAndTopup;
