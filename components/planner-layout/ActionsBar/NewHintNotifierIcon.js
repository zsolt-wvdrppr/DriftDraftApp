import { IconBulbFilled } from '@tabler/icons-react';

const NewHintNotifierIcon = ({trigger}) => {
  return (
    <IconBulbFilled
          className={`top-2 left-1 ${trigger ? "text-yellow-400 animate-bounce" : "dark:text-white text-brandPink"}`}
          size={32}
        />
  )
}

export default NewHintNotifierIcon