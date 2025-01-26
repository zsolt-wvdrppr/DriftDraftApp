import { IconPower } from "@tabler/icons-react";
import { Link, Button } from "@heroui/react";

import { useSessionContext } from "@/lib/SessionProvider";
import logger from "@/lib/logger";
import { cn } from "@/lib/utils";

export const LogInBtn = ({ onPress, className }) => {
  return (
    <Button className={className} onPress={onPress}>
      Login
      <IconPower className="text-success" />
    </Button>
  );
};

export const LogOutBtn = ({
  user,
  onPress,
  labelClassName = "",
  className = "",
}) => {
  const { logOutUser } = useSessionContext();

  const handleClick = async () => {
    logger.info("Logging out...");
    onPress();
    logOutUser();
  };

  return (
    <>
      <p
        className={cn(
          "text-primary dark:text-slate-200 text-xs px-4 flex flex-col",
          labelClassName
        )}
      >
        <span>Logged in:</span>
        <span className="">{user.email}</span>
      </p>
      <Button as={Link} className={className} onPress={handleClick}>
        Logout
        <IconPower className="text-danger" />
      </Button>
    </>
  );
};

export const LogInOutBtn = ({ user, onLogOut, onLogIn, className = "", labelClassName = "" }) => {
  return user ? (
    <LogOutBtn className={className} labelClassName={labelClassName} user={user} onPress={onLogOut} />
  ) : (
    <LogInBtn className={className} onPress={onLogIn} />
  );
};

export default LogInOutBtn;
