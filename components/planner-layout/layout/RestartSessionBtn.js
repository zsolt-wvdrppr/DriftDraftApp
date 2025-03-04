"use client"; // Required when using useState and useTransition

import { Button } from "@heroui/react";
import { useRouter, usePathname } from "next/navigation";
import { IconFilePlus } from "@tabler/icons-react";
import { useTransition } from "react";
import { Tooltip } from "react-tooltip";

import logger from "@/lib/logger";
import { useSessionContext } from "@/lib/SessionProvider";

const RestartSessionBtn = ({ children, targetPathname }) => {
  const { startNewSession } = useSessionContext();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handlePress = () => {
    startTransition(() => {
      logger.info("Starting new session...");
  
      if (pathname !== `/${targetPathname}`) {
        router.push(`/${targetPathname}?step=0`);
      } else {
        // Workaround for updating the URL without reloading the page and force rerender due to Next.JS bullshit bug
        window.history.pushState({}, "", `/${targetPathname}?step=0`);
      }

      // Get planType from targetPathname
      const planType = targetPathname.split('-')[0];

      logger.info("[RESTART SESSION BUTTON] - planType:", planType);

      startNewSession(planType);

    });
  };

  return (
    <>
      <Button
        className="new-session-btn flex flex-col items-center self-end h-16 gap-2"
        id="restart-session"
        isDisabled={isPending}
        onPress={handlePress}
      >
        <div className="flex items-center gap-4">
          <div>{children}</div>
          <IconFilePlus className="text-secondary" size={30} />
        </div>
      </Button>
      <Tooltip anchorSelect="#restart-session" place="top">
        Start a new session
      </Tooltip>
    </>
  );
};

export default RestartSessionBtn;
