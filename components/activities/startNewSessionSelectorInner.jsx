import RestartSessionBtn from '@/components/websitePlanner/layout/RestartSessionBtn'

const newSessionSelectorInner = () => {
  return (
    <div className='flex bg-default-200 items-center border w-fit rounded-md hover:opacity-80'>
      <RestartSessionBtn>
      <p className='text-xs text-left text-primary'>Start a new<br/>Website Plan</p>
      </RestartSessionBtn>
    </div>
  )
}

export default newSessionSelectorInner