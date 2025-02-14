import { IconUser } from "@tabler/icons-react";
import { Link } from "@heroui/react";

import { cn } from "@/lib/utils/utils";

const AccountBtn = ({ user = null, label = "", className = "", labelClassName = "", onPress = ()=>{} }) => {

  return (
    <div className="flex items-center">
      <Link className={cn("md:bg-default-200 md:py-2 md:px-4 md:rounded-l-full cursor-pointer", className)} href="/account" onPress={onPress}>
        <IconUser size={24} />
        {(user || label) && (
        <p
          className={cn(
            "text-primary dark:text-slate-200 text-xs flex flex-col",
            labelClassName
          )}
        >
          <span className="">{label || user.email}</span>
        </p>
        )}
      </Link>
    </div>
  );
};

export default AccountBtn;
