"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useTransition,
  Suspense,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
} from "@heroui/react";
import {
  IconCheck,
  IconPlant,
  IconUsersGroup,
  IconMagnet,
  IconRocket,
  IconDiamond,
  IconWriting,
  IconMoodSmileBeam,
  IconBulb,
  IconAddressBook,
} from "@tabler/icons-react";
import { useRouter, usePathname } from "next/navigation";
import { Spinner } from "@heroui/react";

import {
  PreviousButton,
  NextButton,
  SubmitButton,
} from "@/components/planner-layout/layout/NavigationButtons";
import RestartSessionBtn from "@/components/planner-layout/layout/RestartSessionBtn";
import { useSessionContext } from "@/lib/SessionProvider";
import { useUpdateTabName } from "@/lib/hooks/useUpdateTabName";
import { useRestoreStep } from "@/lib/hooks/useRestoreStep";
import { useProfileUpdater } from "@/lib/hooks/useProfileUpdater";
import {
  updateUrlParams,
  handleValidation,
  goToNextStep,
  goToPreviousStep,
  handleSubmit,
  handleSectionPicker,
} from "@/lib/plannerFormNavigation";
import { useAuth } from "@/lib/AuthContext";
import logger from "@/lib/logger";

import ProgressBar from "./ProgressBar";
import StepPurpose from "./StepPurpose";
import StepAudience from "./StepAudience";
import StepMarketing from "./StepMarketing";
import StepCompetitors from "./StepCompetitors";
import StepUSPs from "./StepUSPs";
import StepBrandGuidelines from "./StepBrandGuidelines";
import StepEmotions from "./StepEmotions";
import StepInspirations from "./StepInspirations";
import StepContactInfo from "./StepContactInfo";
import Result from "./Result";

// Step definitions
const steps = [
  { id: 0, label: "Purpose", icon: <IconPlant />, component: StepPurpose },
  {
    id: 1,
    label: "Audience",
    icon: <IconUsersGroup />,
    component: StepAudience,
  },
  { id: 2, label: "Marketing", icon: <IconMagnet />, component: StepMarketing },
  {
    id: 3,
    label: "Competitors",
    icon: <IconRocket />,
    component: StepCompetitors,
  },
  {
    id: 4,
    label: "Unique Selling Points",
    icon: <IconDiamond />,
    component: StepUSPs,
  },
  {
    id: 5,
    label: "Brand Guidelines",
    icon: <IconWriting />,
    component: StepBrandGuidelines,
  },
  {
    id: 6,
    label: "Emotions",
    icon: <IconMoodSmileBeam />,
    component: StepEmotions,
  },
  {
    id: 7,
    label: "Inspirations",
    icon: <IconBulb />,
    component: StepInspirations,
  },
  {
    id: 8,
    label: "Contact Details",
    icon: <IconAddressBook />,
    component: StepContactInfo,
  },
];

export default function LandingWizardContainer({}) {
  const { user, loading } = useAuth(); // Access user state

  // If no user is logged in, redirect to login page
  useEffect(() => {
    if (!user && !loading) {
      logger.debug("[WIZZ] No user found. Redirecting to login page.");
      router.push("/login");
    }
  }, [user, loading]);

  const {
    sessionData,
    updateSessionData,
    isInitialised,
    error,
    setError,
    success,
    setSuccess,
    clearLocalStorage,
    currentStep,
    setCurrentStep,
    setSteps,
    updateSessionInDb,
  } = useSessionContext();

  useEffect(() => {
    setSteps(steps);
  }, []);

  const [isSubmitted, setIsSubmitted] = useState(false); // Track submission state
  const [tabName, setTabName] = useState(steps[0]?.label || "");
  const stepRef = useRef(null);
  const [isPending, startTransition] = useTransition();
  const formData = sessionData?.formData || {};

  const router = useRouter();
  const pathname = usePathname();

  useProfileUpdater(user);
  useRestoreStep(formData, setCurrentStep, "/landingpage-planner");
  useUpdateTabName(currentStep, steps, setTabName);

  const errorToast = (message, duration = 5000) => {
    toast.error(message, {
      duration,
      closeButton: true,
      classNames: { toast: "text-danger" },
    });
  };

  // Handle error toast and reset
  useEffect(() => {
    if (error) {
      errorToast(error);
      handleFormDataUpdate("isValid", false);
      const timeout = setTimeout(() => setError(null), 5000);

      return () => clearTimeout(timeout);
    }
    if (success) {
      handleFormDataUpdate("isValid", true);
      const timeout = setTimeout(() => setSuccess(null), 5000);

      return () => clearTimeout(timeout);
    }
  }, [error]);

  const handleFormDataUpdate = (keyOrStep, valueOrObject) => {
    const isFullStepUpdate =
      typeof keyOrStep === "number" && typeof valueOrObject === "object";
    const stepNumber = isFullStepUpdate ? keyOrStep : currentStep;

    const stepData = formData[stepNumber] || {};

    const update =
      isFullStepUpdate ?
        { ...stepData, ...valueOrObject }
      : { ...stepData, [keyOrStep]: valueOrObject };

    // Check if update is actually needed
    if (JSON.stringify(formData[stepNumber]) === JSON.stringify(update)) {
      console.debug("No meaningful change detected. Skipping update.");

      return; // Prevent unnecessary update
    }

    const updatedFormData = {
      ...formData,
      [stepNumber]: update,
    };

    updateSessionData("formData", updatedFormData);
  };

  // Validate the current step and move to the next one
  const handleNext = () => {
    goToNextStep(
      currentStep,
      steps,
      validateStep,
      stepRef,
      formData,
      handleFormDataUpdate,
      setCurrentStep,
      updateUrlParams
    );
    if (user?.id && sessionData) {
      logger.debug("[WIZZ] updating session data");
      const _userId = user.id;
      const _sessionId = sessionData.sessionId;
      const _sessionData = sessionData;

      updateSessionInDb(_userId, _sessionId, _sessionData);
    } else {
      logger.debug("[WIZZ] database update failed");
    }
  };

  // Navigate to the previous step
  const handlePrevious = () => {
    goToPreviousStep(currentStep, setCurrentStep, updateUrlParams);
  };

  // Handle form submission
  const handleFormSubmit = () => {
    handleSubmit(
      loading,
      user,
      router,
      currentStep,
      steps,
      stepRef,
      formData,
      handleFormDataUpdate,
      clearLocalStorage,
      setError,
      setIsSubmitted,
      startTransition,
      pathname
    );
    if (user?.id && sessionData) {
      const _userId = user.id;
      const _sessionId = sessionData.sessionId;
      const _sessionData = sessionData;

      updateSessionInDb(_userId, _sessionId, _sessionData);
    }
  };

  const CurrentStepComponent = steps[currentStep]?.component;

  const handlePicker = (index) => {
    handleSectionPicker(
      index,
      currentStep,
      validateStep,
      formData,
      setCurrentStep,
      updateUrlParams,
      setError
    );
  };

  const validateStep = () => {
    const exceptionsArr = [7];

    return handleValidation(
      stepRef,
      currentStep,
      formData,
      handleFormDataUpdate,
      exceptionsArr // Steps that don't require AI suggestion
    );
  };

  if (loading || isPending || !isInitialised) {
    return (
      <div className="flex items-center justify-center h-screen select-none">
        <Spinner color="primary" size="large" />
      </div>
    );
  }

  return (
    <div className="wizard-container w-full overflow-hidden mb-16">
      <div className="step-0 sicky w-full -z-50" />

      {isSubmitted && <Result formData={formData} />}

      {!isSubmitted && (
        <div className="wizard-container relative max-w-screen-xl w-full h-max px-0 md:py-4">
          <div className="step-1 flex">
            <RestartSessionBtn targetPathname={"landingpage-planner"} />
            <ProgressBar currentStep={currentStep} totalSteps={steps.length} />
          </div>
          {/* Dropdown for Navigation */}
          <div className="step-2 w-full flex justify-around px-6 md:px-0 py-6 md:py-0">
            <Dropdown>
              <DropdownTrigger>
                <Button
                  className="section-selector-dropdown capitalize w-full md:max-w-80"
                  color="secondary"
                  variant="flat"
                >
                  <div className="grid grid-cols-4 items-center w-full">
                    <span className="col-span-1 text-primary">
                      {steps[currentStep]?.icon}
                    </span>
                    <span className="col-span-2 text-lg">{tabName}</span>
                    <span className="col-span-1 justify-self-end">
                      {formData && formData[currentStep]?.isValid && (
                        <IconCheck
                          className="text-secondaryPersianGreen"
                          size={20}
                        />
                      )}
                    </span>
                  </div>
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Step navigation"
                color="primary"
                variant="flat"
              >
                {steps.map((step, index) => (
                  <DropdownItem
                    key={step.id}
                    className={`flex flex-row hover:!text-neutralDark dark:hover:!text-slate-200 ${currentStep === index ? "bg-slate-200 dark:text-neutralDark font-bold" : ""}`}
                    textValue={step.label}
                    onPress={() => handlePicker(index)}
                  >
                    <div className="grid grid-cols-4 items-center w-full">
                      <span className="col-span-1 text-primary">
                        {step.icon}
                      </span>
                      <span className="col-span-2">{step.label}</span>
                      <span className="col-span-1 justify-self-end">
                        {formData && formData[step.id]?.isValid && (
                          <IconCheck
                            className="text-secondaryPersianGreen"
                            size={16}
                          />
                        )}
                      </span>
                    </div>
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </div>
          {/* Step Content with Loading Placeholder */}
          <Suspense
            fallback={
              <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            }
          >
            <AnimatePresence mode="wait">
              {CurrentStepComponent ?
                <motion.div
                  key={currentStep}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  initial={{ opacity: 0, x: 50 }}
                  transition={{ duration: 0.5 }}
                >
                  <CurrentStepComponent ref={stepRef} />
                </motion.div>
              : <div className="text-center p-4">
                  No component defined for this step.
                </div>
              }
            </AnimatePresence>
          </Suspense>
          {/* Navigation Buttons */}
          <div className="fixed z-50 rounded-xl bottom-0 backdrop-blur-sm bg-white/50 dark:bg-content1/50 md:backdrop-blur-none md:relative navigation-buttons w-full flex gap-2 justify-between md:justify-evenly pt-1 md:py-8">
            <PreviousButton
              disabled={currentStep <= 0}
              onPress={handlePrevious}
            />
            {currentStep < steps.length - 1 ?
              <NextButton isPending={isPending} onPress={handleNext} />
            : <SubmitButton isPending={isPending} onPress={handleFormSubmit} />}
          </div>
        </div>
      )}
    </div>
  );
}
