import { IconUser } from "@tabler/icons-react";
import { Link } from "@heroui/react";

import { cn } from "@/lib/utils/utils";
import { useUserProfile } from "@/lib/hooks/useProfile";

const AccountBtn = ({ user = null, label = "", noLabel = false, className = "", labelClassName = "", onPress = ()=>{} }) => {

  const { fullName } = useUserProfile(user?.id);

  // First name
  const first_name = fullName?.split(" ")[0] || user?.user_metadata?.full_name?.split(" ")[0] || user?.user_metadata?.name?.split(" ")[0];

  return (
    <div className="flex items-end">
      <Link className={cn("md:bg-default-200 md:py-2 md:px-4 md:rounded-xl items-end cursor-pointer flex gap-2", className)} href="/account" onPress={onPress}>
        <IconUser className="text-primary" size={24}/>
        {!noLabel && (
        <p
          className={cn(
            "",
            labelClassName
          )}
        >
          <span className="text-default-500 dark:text-default-600 text-sm">{label || first_name}</span>
        </p>
        )}
      </Link>
    </div>
  );
};

export default AccountBtn;
