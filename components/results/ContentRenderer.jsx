// File: components/results/NewContentRenderer.jsx
// Clean card + accordion layout that works for both landing page and website results

import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  Button,
  Accordion,
  AccordionItem,
  Chip,
  useDisclosure,
} from "@heroui/react";
import ReactMarkdown from "react-markdown";
import {
  IconCopy,
  IconDownload,
  IconShare,
  IconFileText,
  IconBrain,
  IconShield,
  IconBolt,
  IconLayout,
  IconTarget,
} from "@tabler/icons-react";
import { toast } from "sonner";

import MyActivitiesBtn from "@/components/nav-layout/MyActivitiesBtn";
import useClipboard from "@/lib/hooks/useClipboard";
import withColorCode from "@/lib/utils/with-color-dots";
import { useGeneratePdf } from "@/lib/hooks/useGeneratePdf";
import { sanitizeFilename } from "@/lib/utils/utils";
import ConfirmationModal from "@/components/activities/ConfirmationModal";
import logger from "@/lib/logger";

const CodeWithColor = withColorCode("code");
const LiWithColor = withColorCode("li");
const PWithColor = withColorCode("p");
const EMWithColor = withColorCode("em");
const StrongWithColor = withColorCode("strong");

const ContentRenderer = ({
  structuredSections = [],
  combinedContent = "",
  generatedTitle,
  firstName,
}) => {
  const { copyToClipboard } = useClipboard();

  // PDF download functionality
  const { generatePdf, isPdfGenerating } = useGeneratePdf();
  const [isProcessLoading, setIsProcessLoading] = useState(false);
  const {
    isOpen: isDownloadModalOpen,
    onOpen: onDownloadOpen,
    onOpenChange: onDownloadOpenChange,
  } = useDisclosure();

  // Extract key insights from first few sections for summary cards
  const summaryInsights = extractSummaryInsights(structuredSections);

  // PDF download effect
  useEffect(() => {
    if (!isPdfGenerating && isProcessLoading) {
      setIsProcessLoading(false);
      onDownloadOpenChange(false);
      logger.debug("PDF generation complete.");
    }
  }, [isPdfGenerating]);

  const confirmDownloadPDF = () => {
    onDownloadOpen();
  };

  const handleDownloadPDF = async () => {
    setIsProcessLoading(true);
    logger.debug("Generating PDF...");

    if (!combinedContent || combinedContent.length < 150) {
      toast.error(
        "Your planning isn't complete yet, and no website plan is available. Please finish the planning to proceed.",
        {
          classNames: { toast: "text-danger" },
          closeButton: true,
          duration: 10000,
        }
      );

      setIsProcessLoading(false);
      onDownloadOpenChange(false);
      return;
    }

    try {
      const fileName =
        generatedTitle ?
          `${sanitizeFilename(generatedTitle)}.pdf`
        : "strategic-blueprint.pdf";

      generatePdf(
        combinedContent,
        generatedTitle || "Strategic Blueprint",
        fileName
      );
    } catch (error) {
      logger.error("Error generating PDF:", error);
      setIsProcessLoading(false);
      onDownloadOpenChange(false);
    }

    if (isPdfGenerating) {
      toast.info("Generating PDF...", {
        classNames: { toast: "text-primary" },
        closeButton: true,
        duration: 10000,
      });
    }
  };

  const handleDownloadMarkdown = () => {
    const content = `# ${generatedTitle}\n\n${combinedContent}`;
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${generatedTitle || "blueprint"}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Markdown file downloaded!");
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: generatedTitle || "Blueprint",
          text: "Check out my blueprint from DriftDraft",
          url: window.location.href,
        });
      } catch (err) {
        if (err.name !== "AbortError") {
          copyToClipboard(window.location.href);
          toast.success("Link copied to clipboard!");
        }
      }
    } else {
      copyToClipboard(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  const getSectionIcon = (label) => {
    const labelLower = label.toLowerCase();
    if (
      labelLower.includes("psychology") ||
      labelLower.includes("strategic foundation")
    )
      return IconBrain;
    if (labelLower.includes("brand") || labelLower.includes("authority"))
      return IconShield;
    if (labelLower.includes("marketing") || labelLower.includes("technical"))
      return IconBolt;
    if (labelLower.includes("wireframe") || labelLower.includes("layout"))
      return IconLayout;
    if (
      labelLower.includes("blueprint") ||
      labelLower.includes("implementation")
    )
      return IconTarget;
    return IconFileText;
  };

  const getSectionColor = (index) => {
    const colors = ["primary", "secondary", "success", "warning", "danger"];
    return colors[index % colors.length];
  };

  return (
    <div className="space-y-6">
      {/* Congratulations Banner */}
      <div className="px-8 py-8 shadow-md border rounded-3xl border-accentMint dark:border-zinc-800 max-w-screen-md mx-auto">
        <p className="text-xl font-semibold text-left text-primary">
          Congratulations, {firstName}, on completing your strategic blueprint!
        </p>
        <p className="text-justify pt-4">
          You've taken a big step toward building a well-organized strategy. 🎉
          The result is shown below, and you can access this blueprint anytime
          under <strong>"My Activities."</strong>
        </p>
        <div className="flex flex-col justify-start items-start py-4 md:pb-4">
          <MyActivitiesBtn className={"text-xs border self-end mb-4"} />
          <p>Here's what you can do:</p>
        </div>
        <ul className="list-disc list-inside text-justify py-4">
          <li>Review or edit your plan</li>
          <li>Download it as a PDF</li>
          <li>Request a quote</li>
        </ul>
        <p className="text-justify">
          Your blueprint might include suggestions for missing details. Feel
          free to use it now or come back later to refine and update it as your
          vision evolves.
        </p>
      </div>

      {/* Main Content - Accordion Sections */}
      <Card className="shadow-lg">
        <CardBody className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Your Strategic Blueprint
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {structuredSections.length} sections • Click to expand each
                section
              </p>
            </div>

            <Button
              size="sm"
              variant="light"
              startContent={<IconCopy className="w-4 h-4" />}
              onPress={() =>
                copyToClipboard(`# ${generatedTitle}\n\n${combinedContent}`)
              }
            >
              Copy All
            </Button>
          </div>

          <Accordion
            variant="splitted"
            className="space-y-2"
            selectionMode="multiple"
          >
            {structuredSections.map((section, index) => {
              const IconComponent = getSectionIcon(section.label);
              const sectionColor = getSectionColor(index);

              return (
                <AccordionItem
                  key={section.id}
                  textValue={`${section.label}: ${section.summary}`} // 👈 Add this line
                  title={
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg bg-${sectionColor}/10 flex items-center justify-center`}
                      >
                        <IconComponent
                          className={`w-4 h-4 text-${sectionColor}`}
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-left">
                          {section.label}
                        </h3>
                        <div className="text-xs text-gray-500 text-left">
                          <ReactMarkdown>{section.summary}</ReactMarkdown>
                        </div>
                      </div>
                      <Chip size="sm" variant="flat" color={sectionColor}>
                        Section {index + 1}
                      </Chip>
                    </div>
                  }
                  classNames={{
                    trigger: "py-4 px-4",
                    content: "pt-0 pb-4 px-4",
                    title: "w-full",
                  }}
                >
                  <div className="space-y-4">
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        variant="light"
                        startContent={<IconCopy className="w-4 h-4" />}
                        onPress={() => copyToClipboard(section.content)}
                      >
                        Copy Section
                      </Button>
                    </div>

                    <div className="prose prose-slate dark:prose-invert max-w-none">
                      <ReactMarkdown
                        components={{
                          code: CodeWithColor,
                          li: LiWithColor,
                          p: PWithColor,
                          em: EMWithColor,
                          strong: StrongWithColor,
                        }}
                      >
                        {section.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                </AccordionItem>
              );
            })}
          </Accordion>
        </CardBody>
      </Card>

      {/* Export Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-center p-6 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
        <div className="text-center sm:text-left">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
            Export Your Blueprint
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Save, share, or copy your strategic plan
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            color="primary"
            variant="solid"
            size="sm"
            startContent={<IconFileText className="w-4 h-4" />}
            onPress={confirmDownloadPDF}
          >
            Download PDF
          </Button>

          <Button
            color="default"
            variant="bordered"
            size="sm"
            startContent={<IconDownload className="w-4 h-4" />}
            onPress={handleDownloadMarkdown}
          >
            Download MD
          </Button>

          <Button
            color="default"
            variant="light"
            size="sm"
            startContent={<IconCopy className="w-4 h-4" />}
            onPress={() =>
              copyToClipboard(`# ${generatedTitle}\n\n${combinedContent}`)
            }
          >
            Copy All
          </Button>

          {/*<Button
            color="default"
            variant="light"
            size="sm"
            startContent={<IconShare className="w-4 h-4" />}
            onPress={handleShare}
          >
            Share
          </Button>*/}
        </div>
      </div>

      {/* Download Confirmation Modal */}
      <ConfirmationModal
        acceptLabel="Download"
        body={`Are you sure you want to download your strategic blueprint as a PDF?`}
        handleAccept={handleDownloadPDF}
        isLoading={isProcessLoading}
        isOpen={isDownloadModalOpen}
        rejectLabel="Cancel"
        title="Download PDF"
        onOpenChange={onDownloadOpenChange}
      />
    </div>
  );
};

// Helper function to extract key insights for summary cards
const extractSummaryInsights = (sections) => {
  if (!sections || sections.length === 0) return [];

  const insights = [];

  // Extract insights from first 3 sections
  sections.slice(0, 3).forEach((section) => {
    const content = section.content;
    const lines = content.split("\n");

    // Look for bullet points or key statements
    for (const line of lines) {
      const trimmed = line.trim();
      if (
        trimmed.startsWith("- ") &&
        trimmed.length > 20 &&
        insights.length < 6
      ) {
        insights.push({
          title: section.label,
          content:
            trimmed.replace("- ", "").substring(0, 80) +
            (trimmed.length > 80 ? "..." : ""),
        });
        break; // Only take first bullet from each section
      }
    }
  });

  return insights;
};

export default ContentRenderer;
