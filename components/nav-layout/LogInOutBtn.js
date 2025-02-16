import { IconLogin2, IconLogout } from "@tabler/icons-react";
import { Button } from "@heroui/react";

import { useSessionContext } from "@/lib/SessionProvider";
import logger from "@/lib/logger";

export const LogInBtn = ({ onChange, className, noTitle = false }) => {
  return (
    <Button className={className} onPress={onChange}>
      <IconLogin2 className="text-success" size={26} />
      {!noTitle && <span>Login</span>}
    </Button>
  );
};

export const LogOutBtn = ({ onChange, className = "", noTitle = false }) => {
  const { logOutUser } = useSessionContext();

  const handleClick = async () => {
    logger.info("Logging out...");

    await logOutUser();
    await onChange();
  };

  return (
    <>
      <Button className={className} onPress={handleClick}>
        <IconLogout className="text-danger" size={26} />
        {!noTitle && <span>Logout</span>}
      </Button>
    </>
  );
};

export const LogInOutBtn = ({
  user,
  onLogOut,
  onLogIn,
  className = "",
  labelClassName = "",
  noTitle = false,
}) => {
  return user ? (
    <LogOutBtn
      className={className}
      labelClassName={labelClassName}
      noTitle={noTitle}
      user={user}
      onChange={onLogOut}
    />
  ) : (
    <LogInBtn className={className} noTitle={noTitle} onChange={onLogIn} />
  );
};

export default LogInOutBtn;
