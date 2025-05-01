import { IconBulbFilled, IconBulb } from "@tabler/icons-react";

const NewHintNotifierIcon = ({ trigger }) => {
  return (
    <>
      {trigger ?
        <IconBulbFilled
          className={`top-2 left-1 ${trigger ? "text-brandPink dark:text-yellow-400 animate-bounce" : " text-brandPink"}`}
          size={32}
        />
      : <IconBulb
          className={`top-2 left-1 ${trigger ? "text-brandPink dark:text-yellow-400 animate-bounce" : "text-brandPink"}`}
          size={32}
        />
      }
    </>
  );
};

export default NewHintNotifierIcon;
