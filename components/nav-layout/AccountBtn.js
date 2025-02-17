import { IconUser } from "@tabler/icons-react";
import { Link, Button } from "@heroui/react";

import { cn } from "@/lib/utils/utils";
import { useUserProfile } from "@/lib/hooks/useProfile";

const AccountBtn = ({ user = null, label = "", noLabel = false, className = "", labelClassName = "", onPress = ()=>{} }) => {

  const { fullName } = useUserProfile(user?.id);

  // First name
  const first_name = fullName?.split(" ")[0] || user?.user_metadata?.full_name?.split(" ")[0] || user?.user_metadata?.name?.split(" ")[0];

  return (
    <div className="flex items-center">
      <Button as={Link} className={cn("md:bg-default-200 md:py-2 md:px-4 md:rounded-t-none items-center hover:scale-105 cursor-pointer flex gap-2", className)} href="/account" onPress={onPress}>
        <IconUser className="text-primary" size={24}/>
        {!noLabel && (
        <p
          className={cn(
            "",
            labelClassName
          )}
        >
          <span className="text-default-foreground">{label || first_name}</span>
        </p>
        )}
      </Button>
    </div>
  );
};

export default AccountBtn;
