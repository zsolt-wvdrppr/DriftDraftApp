import { IconPower } from "@tabler/icons-react";
import { Link, Button } from "@heroui/react";

import { useSessionContext } from "@/lib/SessionProvider";
import logger from "@/lib/logger";


export const LogInBtn = ({ onPress, className, noTitle = false }) => {
  return (
    <Button className={className} onPress={onPress}>
      {!noTitle && <span>Login</span>}
      <IconPower className="text-success" />
    </Button>
  );
};

export const LogOutBtn = ({
  onPress,
  className = "",
  noTitle = false,
}) => {
  const { logOutUser } = useSessionContext();

  const handleClick = async () => {
    logger.info("Logging out...");
    onPress();
    logOutUser();
  };

  return (
    <>      
      <Button as={Link} className={className} onPress={handleClick}>
        {!noTitle && <span>Logout</span>}
        <IconPower className="text-danger" />
      </Button>
    </>
  );
};

export const LogInOutBtn = ({ user, onLogOut, onLogIn, className = "", labelClassName = "", noTitle = false }) => {
  return user ? (
    <LogOutBtn className={className} labelClassName={labelClassName} noTitle={noTitle} user={user} onPress={onLogOut} />
  ) : (
    <LogInBtn className={className} noTitle={noTitle} onPress={onLogIn} />
  );
};

export default LogInOutBtn;
