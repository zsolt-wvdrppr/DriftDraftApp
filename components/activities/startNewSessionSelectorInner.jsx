import RestartSessionBtn from "@/components/planner-layout/layout/RestartSessionBtn";

const newSessionSelectorInner = () => {
  return (
    <div className="flex gap-4 justify-around md:justify-start pb-4">
      <div className="flex bg-default-200 items-center border w-32 rounded-md hover:opacity-80">
        <RestartSessionBtn targetPathname="website-planner">
          <p className="text-xs text-left text-primary">
            New
            <br />
            Website
            <br />
            Plan
          </p>
        </RestartSessionBtn>
      </div>
      <div className="flex bg-default-200 items-center border w-32 rounded-md hover:opacity-80">
        <RestartSessionBtn targetPathname="landingpage-planner">
          <p className="text-xs text-left text-primary">
            New
            <br />
            Landing
            <br />
            Page Plan
          </p>
        </RestartSessionBtn>
      </div>
    </div>
  );
};

export default newSessionSelectorInner;
