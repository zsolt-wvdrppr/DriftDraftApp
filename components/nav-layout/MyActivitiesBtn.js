import React from "react";
import { Link, Button } from "@heroui/react";
import { IconHistory } from "@tabler/icons-react";

import { cn } from "@/lib/utils/utils";
import { siteConfig } from "@/config/site";
import logger from "@/lib/logger";

const MyActivitiesBtn = ({className, label = "", noLabel = false, onPress = () => {}}) => {

    const handlePress = () => {
        if (onPress && typeof onPress === "function") {
            logger.debug("MyActivitiesBtn: onPress");
            onPress();
        }
    }


  return (
    <Button
      as={Link}
      className={cn("text-default-foreground hover:scale-105", className)}
      href={siteConfig.links.activities}
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
