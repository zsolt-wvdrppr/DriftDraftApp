import { useEffect, useState, useRef, useTransition } from "react";
import { Reorder, AnimatePresence } from "framer-motion";
import { Link, Switch, useDisclosure } from "@heroui/react";
import { Tooltip } from "react-tooltip";
import { toast } from "sonner";
import {
  IconPencilStar,
  IconReorder,
  IconTrash,
  IconDownload,
  IconEye,
  IconMessageDollar,
  IconArrowNarrowUp,
} from "@tabler/icons-react";

import { useSessionContext } from "@/lib/SessionProvider";
import logger from "@/lib/logger";
import {
  formatDateToLocalBasic,
  sanitizeFilename,
  sortItemsByDate,
} from "@/lib/utils/utils";

import ConfirmationModal from "@/components/activities/ConfirmationModal";
import { useGeneratePdf } from "@/lib/hooks/useGeneratePdf";
import MarkdownModalViewer from "./MarkModalViewer";

const Sessions = ({ userId }) => {
  const {
    fetchAllSessionsFromDb,
    fetchSessionFromDb,
    deleteSessionFromDb,
    initSessionFromDb,
    fetchAiGeneratedPlanFromDb,
    updateSessionTitleInDb,
  } = useSessionContext();

  const [isPending, startTransition] = useTransition();

  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [markdownContent, setMarkdownContent] = useState("");
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [isFetchingInProgress, setIsFetchingInProgress] = useState(true);

  const { generatePdf, isPdfGenerating } = useGeneratePdf();
  const [isProcessLoading, setIsProcessLoading] = useState(false);
  const inputRefs = useRef({});

  useEffect(() => {
    logger.debug(`[SESSIONS] - Sessions changed:`, items);
  }, [items]);

  // log userId
  useEffect(() => {
    logger.debug(`[USER ID] - User ID:`, userId);
  }, [userId]);

  const {
    isOpen: isDownloadModalOpen,
    onOpen: onDownloadOpen,
    onOpenChange: onDownloadOpenChange,
  } = useDisclosure();
  const {
    isOpen: isMarkdownModalOpen,
    onOpen: onMarkdownOpen,
    onOpenChange: onMarkdownOpenChange,
  } = useDisclosure();

  useEffect(() => {
    if (!userId) return;

    startTransition(() => {
      const fetchSessions = async () => {
        try {
          logger.info("Fetching sessions from DB...");
          setIsFetchingInProgress(true);
          const sessions = await fetchAllSessionsFromDb(userId); // Await the data

          setIsFetchingInProgress(false);
          handleItemsChange(sessions, true); // Update the state with the fetched sessions
        } catch (error) {
          logger.error("Error fetching sessions from DB:", error.message);
        }
      };

      fetchSessions(); // Call the async function
    });
  }, [userId]);

  const handleItemsChange = (newItems, isAcending = false) => {
    setItems(sortItemsByDate(newItems, isAcending));
  };

  const confirmDownload = (item) => {
    logger.debug("confirmDownload", item);
    setSelectedItem(item);
    onDownloadOpen();
  };

  const handleDownload = async (item) => {
    setIsProcessLoading(true);
    logger.debug("Generating PDF...");
    const generatedPlan = await fetchAiGeneratedPlanFromDb(item.session_id);

    if (
      generatedPlan === null ||
      generatedPlan === "" ||
      generatedPlan?.length < 150
    ) {
      toast.error(
        "This planning isn't complete yet. Please ask your client to finish the planning to proceed.",
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
      generatePdf(
        generatedPlan,
        item.session_title,
        `${sanitizeFilename(item.session_title)}.pdf`
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

  useEffect(() => {
    if (!isPdfGenerating && isProcessLoading) {
      setIsProcessLoading(false);
      onDownloadOpenChange(false);
      logger.debug("PDF generation complete.");
    }
  }, [isPdfGenerating]);

  const handleOpenMarkdownModal = async (item) => {
    setSelectedItem(item);
    setIsLoadingContent(true);
    onMarkdownOpen(); // Open the modal

    try {
      const generatedPlan = await fetchAiGeneratedPlanFromDb(item.session_id);
      setMarkdownContent(generatedPlan || "No content available.");
    } catch (error) {
      toast.error("Failed to fetch content.", {
        classNames: { toast: "text-danger" },
      });
      setMarkdownContent("Error loading content.");
      console.error("Error fetching markdown content:", error);
    } finally {
      setIsLoadingContent(false);
    }
  };

  return (
    <div className="space-y-6 flex flex-col">
      {items.length > 0 && (
        <div className="w-full flex justify-end items-center">
          <Switch
            className=""
            defaultSelected
            color="default"
            size="md"
            thumbIcon={({ isSelected }) => (
              <IconArrowNarrowUp
                className={`${isSelected ? "rotate-180" : ""} transition-all text-primary`}
              />
            )}
            onValueChange={(value) => {
              handleItemsChange(items, value);
            }}
          >
            <span className="text-xs leading-4 flex flex-col">
              <span>Sort by</span>
              <span>Date</span>
            </span>
          </Switch>
        </div>
      )}
      <Reorder.Group
        axis="y"
        className="flex flex-col gap-4 md:grid md:grid-cols-2 md:gap-4 xl:grid-cols-3 2xl:grid-cols-4 xl:gap-6"
        values={items}
        onReorder={setItems}
      >
        {items.length > 0 && (
          <AnimatePresence className="">
            {items.map((item) => {
              //logger.debug("Item:", item);

              return (
                <Reorder.Item
                  key={item?.session_id}
                  animate={{ opacity: 1, y: 0 }}
                  className="dark:bg-default-200 border dark:border-default-400 shadow-md p-4 rounded-md flex flex-col items-center justify-between gap-4 select-none"
                  drag={false}
                  exit={{ opacity: 0, x: 100 }}
                  initial={{ opacity: 0, y: 20 }}
                  value={item}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="relative w-full">
                    <div className="absolute bg-primary/60 text-white text-sm rounded-br-lg rounded-tl-md -top-4 -left-4 py-1 px-2">
                      <p>{item.type}</p>
                    </div>
                  </div>
                  <div className="relative w-fit py-4">
                    <div>
                      <h2 className="font-semibold">{item.session_title}</h2>
                    </div>
                  </div>

                  <div className="flex gap-2 w-full">
                    <div className="flex w-full justify-around">
                      <div>
                        <Link
                          className="dark:text-white cursor-pointer hover:scale-125 transition-all"
                          isDisabled={false}
                          onPress={() => confirmDownload(item)}
                        >
                          <IconDownload
                            className="text-teal-500"
                            id="download-icon"
                          />
                        </Link>
                        <Tooltip anchorSelect="#download-icon" place="top">
                          Download as PDF
                        </Tooltip>
                      </div>
                      <div>
                        <Link
                          className="dark:text-white cursor-pointer hover:scale-125 transition-all"
                          onPress={() => handleOpenMarkdownModal(item)}
                        >
                          <IconEye className="text-lime-500" id="view-icon" />
                        </Link>
                        <Tooltip anchorSelect="#view-icon" place="top">
                          View plan
                        </Tooltip>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-around w-full">
                    <p className="text-sm text-primary max-w-28">
                      <b>Created</b> {formatDateToLocalBasic(item.created_at)}
                    </p>
                    <p className="text-sm text-right text-primary max-w-28">
                      <b>Last edit</b> {formatDateToLocalBasic(item.updated_at)}
                    </p>
                  </div>
                </Reorder.Item>
              );
            })}
          </AnimatePresence>
        )}
      </Reorder.Group>

      {/* Download Confirmation Modal */}
      <ConfirmationModal
        acceptLabel="Download"
        body={`Are you sure you want to download ${selectedItem?.session_title}?`}
        handleAccept={() => handleDownload(selectedItem)}
        isLoading={isProcessLoading}
        isOpen={isDownloadModalOpen}
        rejectLabel="Cancel"
        title="Download PDF"
        onOpenChange={onDownloadOpenChange}
      />

      {/* Markdown Modal Viewer */}
      <MarkdownModalViewer
        isOpen={isMarkdownModalOpen}
        mdContent={markdownContent}
        onOpenChange={onMarkdownOpenChange}
        onClose={() => onMarkdownOpenChange(false)}
        title={selectedItem?.session_title}
      />
    </div>
  );
};

export default Sessions;
