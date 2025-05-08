import ReactMarkdown from "react-markdown";

import VideoPlayer from "@/components/planner-layout/video-player";

const PurposeGuide = () => {
  const introText = `
## Defining Your Purpose

This section establishes the foundation of your website blueprint—a comprehensive plan you can pass to developers. Clear answers here help avoid future drawbacks like missing analytics for marketing campaigns, inadequate user flows, or security vulnerabilities. Your input shapes the entire strategy.
  `;

  const quickGuideText = `
#### Quick Guide:

1. **Select your primary purpose** - Choose your main website goal
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
  `;

  return (
    <div className="space-y-4 text-sm">
      <div className="markdown-content prose prose-headings:text-lg prose-headings:font-semibold">
        <ReactMarkdown>{introText}</ReactMarkdown>
      </div>

      <div className="p-4 h-full -mb-1 overflow-hidden rounded-xl">
        <VideoPlayer
          loop
          aspectRatio="1400:1080"
          className="overflow-hidden rounded-xl border"
          controls={false}
          muted={true}
          playing={true}
          url="/guide-videos/website-planner-purpose.mp4"
        />
      </div>

      <div className="bg-blue-50 p-4 rounded-md">
        <div className="markdown-content text-blue-700">
          <ReactMarkdown>{quickGuideText}</ReactMarkdown>
        </div>
      </div>

      <div className="bg-yellow-50 p-4 rounded-md">
        <div className="markdown-content text-yellow-700">
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
