import { IconUser } from "@tabler/icons-react";
import { Button } from "@heroui/react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils/utils";
import { useUserProfile } from "@/lib/hooks/useProfile";

const AccountBtn = ({
  user = null,
  label = "",
  noLabel = false,
  className = "",
  labelClassName = "",
  onPress = () => {},
}) => {
  const router = useRouter();

  const { fullName } = useUserProfile(user?.id);

  // First name
  const first_name =
    fullName?.split(" ")[0] ||
    user?.user_metadata?.full_name?.split(" ")[0] ||
    user?.user_metadata?.name?.split(" ")[0];

  const handleOnPress = async () => {
    router.push("/account");
    if (onPress && typeof onPress === "function") {
      onPress();
    }
  };

  return (
    <div className="flex items-center">
      <Button
        className={cn(
          "account-btn md:bg-default-200 md:py-2 md:px-4 md:rounded-t-none items-center hover:scale-105 cursor-pointer flex gap-2",
          className
        )}
        onPress={handleOnPress}
      >
        <IconUser className="text-primary" size={24} />
        {!noLabel && (
          <p className={cn("", labelClassName)}>
            <span className="text-default-foreground">
              {label || first_name}
            </span>
          </p>
        )}
      </Button>
    </div>
  );
};

export default AccountBtn;
