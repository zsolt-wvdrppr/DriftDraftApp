import React from "react";
import { Button } from "@heroui/react";
import { IconHistory } from "@tabler/icons-react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils/utils";
import { siteConfig } from "@/config/site";
import logger from "@/lib/logger";

const MyActivitiesBtn = ({
  className,
  label = "",
  noLabel = false,
  onPress = () => {},
}) => {
  const router = useRouter();

  const handlePress = async () => {
    router.push(siteConfig.links.activities);
    if (onPress && typeof onPress === "function") {
      logger.debug("MyActivitiesBtn: onPress");
      onPress();
    }
  };

  return (
    <Button
      className={cn("activities-btn text-default-foreground hover:scale-105", className)}
      isExternal={false}
      startContent={<IconHistory className="text-highlightOrange" />}
      variant="flat"
      onPress={handlePress}
    >
      {noLabel ? "" : label || "My Activities"}
    </Button>
  );
};

export default MyActivitiesBtn;
