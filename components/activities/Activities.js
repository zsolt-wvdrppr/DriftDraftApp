"use client";

import { useEffect, useState, useRef, useTransition } from "react";
import { Reorder, AnimatePresence } from "framer-motion";
import { Button, Link, useDisclosure, Spinner, Switch, Input } from "@heroui/react";
import {
  IconReorder,
  IconTrash,
  IconEye,
  IconMessageDollar,
  IconSquareRoundedXFilled,
  IconInfoCircleFilled,
  IconPencilStar,
  IconArrowNarrowUp,
  IconDownload,
} from "@tabler/icons-react";
import { Tooltip } from "react-tooltip";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { useReCaptcha } from "next-recaptcha-v3";

import { createOrUpdateProfile } from "@/lib/supabaseClient";
import logger from "@/lib/logger";
import { useAuth } from "@/lib/AuthContext";
import { useSessionContext } from "@/lib/SessionProvider";
import {
  formatDateToLocalBasic,
  sanitizeFilename,
  sortItemsByDate as handleSortItemsByDate,
} from "@/lib/utils/utils";
import { useGeneratePdf } from "@/lib/hooks/useGeneratePdf";

import EditableMarkdownModal from "../planner-layout/layout/EditableMarkdownModal";

import { initialConfig } from "./lexical_config";
import { legend } from "./utils";
import sendSessionToPlanfix from "./sendSessionToPlanfix";
import ConfirmationModal from "./ConfirmationModal";
import NewSessionSelectorInner from "./startNewSessionSelectorInner";

export default function UserActivities() {
  const {
    fetchAllSessionsFromDb,
    fetchSessionFromDb,
    deleteSessionFromDb,
    initSessionFromDb,
    fetchAiGeneratedPlanFromDb,
    updateSessionTitleInDb,
  } = useSessionContext();
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const {
    isOpen: isDeleteModalOpen,
    onOpen: onDeleteOpen,
    onOpenChange: onDeleteOpenChange,
  } = useDisclosure();
  const {
    isOpen: isQuoteModalOpen,
    onOpen: onQuoteOpen,
    onOpenChange: onQuoteOpenChange,
  } = useDisclosure();
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
  const [markdownContent, setMarkdownContent] = useState("");
  const [isLoadingContent, setIsLoadingContent] = useState(false);

  const [isPending, startTransition] = useTransition();
  const { user, loading } = useAuth(); // Access user state
  const router = useRouter();
  const inputRefs = useRef({});
  const { executeRecaptcha } = useReCaptcha(); // Hook to generate token
  const [isFetchingInProgress, setIsFetchingInProgress] = useState(true);

  const { generatePdf, isPdfGenerating } = useGeneratePdf();

  const [isProcessLoading, setIsProcessLoading] = useState(false);

  useEffect(() => {
    if (!user?.id) return;

    startTransition(() => {
      const fetchSessions = async () => {
        try {
          logger.info("Fetching sessions from DB...");
          setIsFetchingInProgress(true);
          const sessions = await fetchAllSessionsFromDb(user.id); // Await the data

          setIsFetchingInProgress(false);
          sortItemsByDate(sessions, true); // Update the state with the fetched sessions
        } catch (error) {
          logger.error("Error fetching sessions from DB:", error.message);
        }
      };

      fetchSessions(); // Call the async function
    });
  }, [user]);

  const sortItemsByDate = (items, isAcending = false) => {
    setItems(handleSortItemsByDate(items, isAcending));
  };

  useEffect(() => {
    if (!loading && !user) {
      // Redirect if user is not logged in
      const redirectPath = `/login?redirect=/activities`;

      router.push(redirectPath);

      return;
    }

    if (!loading && user) {
      logger.debug("ensureProfileExists:", user);

      (async () => {
        await createOrUpdateProfile();
      })();
    }
  }, [loading, user, router]);

  const confirmDelete = (item) => {
    setSelectedItem(item);
    onDeleteOpen();
  };

  const handleDelete = () => {
    setIsProcessLoading(true);
    if (selectedItem) {
      setItems(
        items.filter((item) => item.session_id !== selectedItem.session_id)
      );
      setSelectedItem(null);
      deleteSessionFromDb(user.id, selectedItem.session_id);
    }
    onDeleteOpenChange(false);
    setIsProcessLoading(false);
  };

  const handleOpenMarkdownModal = async (item) => {
    setSelectedItem(item);
    setIsLoadingContent(true);
    onMarkdownOpen(); // Open the modal

    try {
      const generatedPlan = await fetchAiGeneratedPlanFromDb(item.session_id);

      setMarkdownContent(generatedPlan || "No content available.");
      setIsLoadingContent(false);
    } catch (error) {
      toast.error("Failed to fetch content.", {
        classNames: { toast: "text-danger" },
      });
      setIsLoadingContent(false);
      setMarkdownContent("Error loading content.");
      console.error("Error fetching markdown content:", error);
    }
  };

  const toastRef = useRef(null);

  const handleToast = () => {
    startTransition(() => {
      if (toastRef.current) {
        // Dismiss the toast and reset state
        toast.dismiss(toastRef.current);
        toastRef.current = null;
      }

      const newToastId = toast.custom(
        (t) => (
          <div className="relative flex w-fit justify-center bg-yellow-100/60 shadow-md rounded-lg">
            <div className="w-fit relative">
              <Button
                className="!absolute -top-4 -left-9 p-2"
                onPress={() => {
                  toast.dismiss(t);
                  toastRef.current = null;
                  Cookies.set("toastDismissed", true, { expires: 365 });
                }}
              >
                <IconSquareRoundedXFilled className="bg-white text-primary rounded-lg" />
              </Button>
              {legend()}
            </div>
          </div>
        ),
        {
          duration: Infinity,
          onDismiss: () => {
            toastRef.current = null;
          },
        }
      );

      toastRef.current = newToastId;
    });
  };

  useEffect(() => {
    if (!isPdfGenerating && isProcessLoading) {
      setIsProcessLoading(false);
      onDownloadOpenChange(false);
      logger.debug("PDF generation complete.");
    }
  }, [isPdfGenerating]);

  useEffect(() => {
    // Check if the toast has been dismissed
    const dismissed = Cookies.get("toastDismissed");

    if (dismissed) return;

    const timeout = setTimeout(() => {
      handleToast();
    }, 500); // Small delay to allow context and DOM readiness

    return () => clearTimeout(timeout); // Cleanup on unmount
  }, []);

  if (isPending || loading || isFetchingInProgress) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner color="primary" />
      </div>
    );
  }

  const handleReview = (item) => {
    startTransition(async () => {
      try {
        logger.info(`Edit item with ID: ${item.session_id}`);
        await initSessionFromDb(user.id, item.session_id); // Wait for the session initialization
        router.push(`/website-planner?step=0`); // Redirect after completion
      } catch (error) {
        logger.error("Error during session initialisation:", error);
      }
    });
  };

  const handleEditTitle = async (item, newTitle) => {
    if (!newTitle.trim()) {
      toast.dismiss();
      toast.error("Title cannot be empty.", {
        classNames: { toast: "text-danger" },
      });

      return;
    }

    try {
      const updatedItems = items.map((i) =>
        i.session_id === item.session_id
          ? { ...i, session_title: newTitle, isEditing: false } // Set isEditing to false after update
          : i
      );

      setItems(updatedItems); // Update state immediately for UX

      await updateSessionTitleInDb(user.id, item.session_id, newTitle); // Update DB
      toast.dismiss();
      toast.success("Title updated successfully!", {
        classNames: { toast: "text-green-600" },
      });
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to update the title.", {
        classNames: { toast: "text-danger" },
      });
      logger.error("Error updating title:", error.message);
    }
  };

  const startEditingTitle = (item) => {
    // Enable editing and set focus
    const updatedItems = items.map((i) =>
      i.session_id === item.session_id ? { ...i, isEditing: true } : i
    );

    setItems(updatedItems);

    setTimeout(() => {
      inputRefs.current[item.session_id]?.focus(); // Focus the correct input
    }, 0);
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

  const confirmGetQuote = (item) => {
    setSelectedItem(item);
    onQuoteOpen();
  };

  const handleGetQuote = async (item) => {
    setIsProcessLoading(true);
    const token = await executeRecaptcha("get_quote");

    if (!token) {
      toast.error("Failed to generate token.", {
        classNames: { toast: "text-danger" },
      });

      return;
    }

    try {
      await sendSessionToPlanfix(
        user,
        item.session_id,
        fetchSessionFromDb,
        token
      );
    } catch (error) {
      logger.error("Error sending session to Planfix:", error);
    }

    onQuoteOpenChange(false);
    setIsProcessLoading(false);
  };

  return (
    <div className="light dark:dark p-4  max-w-2xl xl:max-w-6xl 2xl:max-w-screen-2xl mx-auto overflow-hidden">
      <NewSessionSelectorInner />
      <div className="w-full flex justify-end my-4 text-primary">
        <Button onPress={() => handleToast()}>
          <IconInfoCircleFilled className="info-icon text-secondary" />
        </Button>

        <Switch
          defaultSelected
          color="default"
          size="md"
          thumbIcon={({ isSelected }) => (
            <IconArrowNarrowUp
              className={`${isSelected ? "rotate-180" : ""} transition-all text-primary`}
            />
          )}
          onValueChange={(value) => {
            sortItemsByDate(items, value);
          }}
        >
          <span className="text-xs leading-4 flex flex-col">
            <span>Sort by</span>
            <span>Date</span>
          </span>
        </Switch>
      </div>
      {(items.length && !loading && !isFetchingInProgress) === 0 && (
        <div className="flex items-center justify-center h-96">
          <p className="text-center text-gray-500">
            No sessions found. Start a new session to get started.
          </p>
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
                  className="bg-white dark:bg-content1 shadow-md p-4 rounded-md flex flex-col items-center justify-between gap-4 select-none"
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
                    {item.isEditing ? (
                      <Input
                        ref={(el) => (inputRefs.current[item.session_id] = el)} // Assign dynamic ref
                        className="border p-2 rounded-md"
                        maxLength={50}
                        type="text"
                        value={item.session_title}
                        onBlur={() => handleEditTitle(item, item.session_title)} // Stop editing when blurred
                        onChange={(e) => {
                          const updatedItems = items.map((i) =>
                            i.session_id === item.session_id
                              ? { ...i, session_title: e.target.value }
                              : i
                          );

                          setItems(updatedItems); // Live update in state for better UX
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleEditTitle(item, item.session_title); // Stop editing on Enter key press
                          }
                        }}
                      />
                    ) : (
                      <div>
                        <h2 className="font-semibold">{item.session_title}</h2>
                        <Link
                          className="text-primary absolute w-4 h-4 -right-4 top-2 hover:scale-125 transition-all"
                          onPress={() => {
                            startEditingTitle(item);
                          }}
                        >
                          <IconPencilStar id="edit-title" />
                        </Link>
                        <Tooltip anchorSelect="#edit-title" place="top">
                          Edit Title
                        </Tooltip>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 w-full">
                    <div className="flex w-full justify-around">
                      <div>
                        <Link
                          className="dark:text-white cursor-pointer hover:scale-125 transition-all"
                          onPress={() => handleReview(item)}
                        >
                          <IconReorder
                            className="text-violet-500"
                            id="review-icon"
                          />
                        </Link>
                        <Tooltip anchorSelect="#review-icon" place="top">
                          Review Questionnaire & Regenerate Plan
                        </Tooltip>
                      </div>
                      <div>
                        <Link
                          className="dark:text-white cursor-pointer hover:scale-125 transition-all"
                          onPress={() => confirmDelete(item)}
                        >
                          <IconTrash
                            className="text-red-500"
                            id="delete-icon"
                          />
                        </Link>
                        <Tooltip anchorSelect="#delete-icon" place="top">
                          Delete
                        </Tooltip>
                      </div>
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
                          View & Edit plan
                        </Tooltip>
                      </div>
                      <div>
                        <Link
                          alt="Request Quote"
                          className="dark:text-white cursor-pointer hover:scale-125 transition-all"
                          isDisabled={false}
                          onPress={() => confirmGetQuote(item)}
                        >
                          <IconMessageDollar
                            className="text-orange-500"
                            id="quote-icon"
                          />
                        </Link>
                        <Tooltip anchorSelect="#quote-icon" place="top">
                          Request a Quote from Wavedropper LTD.
                        </Tooltip>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-around w-full">
                    <p className="text-sm text-gray-500 max-w-28">
                      <b>Created</b> {formatDateToLocalBasic(item.created_at)}
                    </p>
                    <p className="text-sm text-right text-gray-500 max-w-28">
                      <b>Last edit</b> {formatDateToLocalBasic(item.updated_at)}
                    </p>
                  </div>
                </Reorder.Item>
              );
            })}
          </AnimatePresence>
        )}
      </Reorder.Group>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        acceptLabel="Confirm"
        body={`Are you sure you want to delete ${selectedItem?.session_title}? This action CANNOT BE UNDONE.`}
        handleAccept={handleDelete}
        isOpen={isDeleteModalOpen}
        rejectLabel="Cancel"
        title="Confirm Deletion"
        onOpenChange={onDeleteOpenChange}
      />

      {/* Get Quote Confirmation Modal */}
      <ConfirmationModal
        acceptLabel="Get Quote"
        body={`Are you sure you want to request a quote for ${selectedItem?.session_title}?`}
        handleAccept={() => handleGetQuote(selectedItem)}
        isLoading={isProcessLoading}
        isOpen={isQuoteModalOpen}
        rejectLabel="Cancel"
        title="Request a Quote"
        onOpenChange={onQuoteOpenChange}
      />

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

      <LexicalComposer initialConfig={initialConfig}>
        <EditableMarkdownModal
          isLoading={isLoadingContent}
          isOpen={isMarkdownModalOpen}
          item={selectedItem}
          markdownContent={markdownContent}
          setMarkdownContent={setMarkdownContent}
          onOpenChange={onMarkdownOpenChange}
        />
      </LexicalComposer>
    </div>
  );
}
