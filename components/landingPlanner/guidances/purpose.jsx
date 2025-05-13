import ReactMarkdown from "react-markdown";

import VideoPlayer from "@/components/video-player/video-player";

const PurposeGuide = () => {
  const introText = `
## Defining Your Purpose

This section establishes the foundation of your landing page blueprint—a comprehensive plan you can pass to developers. Clear answers here help avoid future drawbacks like missing analytics for marketing campaigns, inadequate user flows, or security vulnerabilities. Your input shapes the entire strategy.
  `;

  const quickGuideText = `
#### Quick Guide:

1. **Select your primary purpose** - Choose your main landing page goal
2. **Add specifics** - Provide details (required for "Other" option)
3. **Describe your service** - Explain your offering and audience benefits
  `;

  const aiPlanningText = `
#### AI-Powered Planning

Your answers inform the AI throughout all sections for tailored recommendations. **More detail = better results**.

Need help? Click **"Refine with AI"** to instantly improve your descriptions.
  `;

  const noteText = `
**Note:** Clicking "Next" saves your session, which you can access later under "My Activities". You can always edit these answers later.

**More below the video!**
  `;

  return (
    <div className="space-y-4 text-sm">
      <div className="markdown-content prose prose-headings:text-lg prose-headings:font-semibold">
        <ReactMarkdown>{introText}</ReactMarkdown>
      </div>

      <div className="p-4 h-full -mb-1 overflow-hidden rounded-xl">
        <VideoPlayer
          loop
          aspectRatio="1584:1080"
          className="overflow-hidden rounded-xl border"
          controls={false}
          muted={true}
          playing={true}
          playbackRate={1}
          url="/guide-videos/website-planner-purpose-lg.mp4"
        />
      </div>

      <div className="bg-blue-50 dark:bg-primary dark:text-white p-4 rounded-md border-l-2 border-blue-500 dark:border-blue-300">
        <div className="markdown-content text-primary">
          <ReactMarkdown>{quickGuideText}</ReactMarkdown>
        </div>
      </div>

      <div className="bg-yellow-50 dark:bg-yellow-800 p-4 rounded-md border-l-2 border-yellow-600 dark:border-yellow-300">
        <div className="markdown-content text-yellow-800 dark:text-white">
          <ReactMarkdown>{aiPlanningText}</ReactMarkdown>
        </div>
      </div>
      <div className="markdown-content italic">
        <ReactMarkdown>{noteText}</ReactMarkdown>
      </div>
    </div>
  );
};

export default PurposeGuide;
