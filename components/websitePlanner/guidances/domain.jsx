import ReactMarkdown from "react-markdown";
import VideoPlayer from "@/components/video-player/video-player";

const DomainGuide = () => {
  const introText = `
## Domain Research: Find Your Online Address

This section helps you discover potential domain names for your website based on your previous answers. A good domain is memorable, relevant to your business, and available for registration.
  `;

  const stepsText = `
#### Quick Steps:

1. **Add keywords** - Optionally enter words you'd like in your domain
2. **Click "Refine with AI"** - Our AI generates domain suggestions based on your business
3. **Check availability** - Click the globe icon next to any domain to verify if it's available
4. **View alternatives** - If a domain is taken, we'll suggest similar available options
5. **Manual check** - Enter any domain in the "Check domain availability" field to test it
  `;

  const proTipText = `
#### Pro Tip: Quick Domain Capture

Use the copy buttons next to domain names to quickly copy them to your clipboard. This makes it easy to register domains you like with your preferred domain registrar.
  `;

  const noteText = `
**Note:** Not all TLDs (Top Level Domains like .com, .net, etc.) are supported by our availability checker. If your preferred domain format is invalid, try a different extension or check with a domain registrar.
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
          playbackRate={1}
          url="/guide-videos/domain-guide-lg.mp4"
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

export default DomainGuide;