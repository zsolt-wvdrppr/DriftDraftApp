import { IconBulbFilled, IconBulb } from "@tabler/icons-react";

import { cn } from "@/lib/utils/utils";

const NewHintNotifierIcon = ({ trigger, className }) => {
  return (
    <div className={cn("h-full w-full", className)}>
      {trigger ?
      <div className={`relative ${trigger ? "-bottom-1" : ""}`}>
        <div className={`absolute ${trigger ? " animate-bounce" : ""}`}>
        <IconBulb className={`${trigger ? "animate-ping" : ""}`} size={32}/>
        </div>
        <IconBulbFilled
          className={`relative ${trigger ? "animate-bounce" : " "}`}
          size={32}
        />
        </div>
      : <IconBulb
          className={`top-2 left-1 h-full`}
          size={32}
        />
      }
    </div>
  );
};

export default NewHintNotifierIcon;
