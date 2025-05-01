import { IconBulbFilled, IconBulb } from "@tabler/icons-react";

const NewHintNotifierIcon = ({ trigger }) => {
  return (
    <>
      {trigger ?
      <div className="relative">
        <div className={`absolute ${trigger ? "animate-bounce" : ""}`}>
        <IconBulb className={`text-brandPink ${trigger ? "animate-ping" : ""}`} size={32}/>
        </div>
        <IconBulbFilled
          className={`top-2 left-1 ${trigger ? "text-brandPink animate-bounce" : " text-brandPink"}`}
          size={32}
        />
        </div>
      : <IconBulb
          className={`top-2 left-1 ${trigger ? "text-brandPink" : "text-brandPink"}`}
          size={32}
        />
      }
    </>
  );
};

export default NewHintNotifierIcon;
