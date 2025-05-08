import ReactMarkdown from "react-markdown";
import VideoPlayer from "@/components/video-player/video-player";

const CompetitorsGuide = () => {
  const introText = `
## Competitor Analysis: Know Your Market

This section helps you identify potential competitors in your industry. Seeing who else operates in your space gives you a starting point to understand the market landscape.
  `;

  const stepsText = `
#### Quick Steps:

1. **Enter your location** - Provide geographic context for relevant results
2. **Click "Refine with AI"** - Our AI finds potential competitors based on your details
3. **Review suggestions** - See what businesses the AI has found
4. **Click "View Suggestion"** - Get basic information about each competitor
  `;

  const proTipText = `
#### Pro Tip: Easy Reference

Use the copy icon next to each URL to quickly copy the website address to your clipboard. This makes it convenient to check out these sites later as you develop your landing page strategy.
  `;

  const noteText = `
**Note:** This feature provides a starting point for competitor awareness, not comprehensive market research. The suggestions are based on your previous answers and location.
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
          url="/guide-videos/competitors-guide.mp4"
        />
      </div>

      <div className="bg-blue-50 p-4 rounded-md">
        <div className="markdown-content text-blue-700">
          <ReactMarkdown>{stepsText}</ReactMarkdown>
        </div>
      </div>

      <div className="bg-yellow-50 p-4 rounded-md">
        <div className="markdown-content text-yellow-700">
          <ReactMarkdown>{proTipText}</ReactMarkdown>
        </div>
      </div>

      <div className="markdown-content italic">
        <ReactMarkdown>{noteText}</ReactMarkdown>
      </div>
    </div>
  );
};

export default CompetitorsGuide;