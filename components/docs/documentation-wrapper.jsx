"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { Button } from "@heroui/react";
import { motion, AnimatePresence } from "framer-motion";
import { IconList, IconArrowBarLeft } from "@tabler/icons-react";
import remarkGfm from "remark-gfm";
import { useSwipeable } from "react-swipeable";

export const DocumentationWrapper = ({
  docContent,
  docsNavigation,
  currentSlug,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  useEffect(() => {
    if (sidebarOpen) {
      // When sidebar opens, immediately hide the button
      setShowMobileSidebar(true);
    } else {
      // When sidebar closes, delay showing the button until animation completes
      const timer = setTimeout(() => {
        setShowMobileSidebar(false);
      }, 300); // Match this with your sidebar transition duration

      return () => clearTimeout(timer);
    }
  }, [sidebarOpen]);

  // Swipe handlers for closing the sidebar
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => setSidebarOpen(false),
    trackMouse: false,
    // Configurable options
    swipeDuration: 500,
    preventScrollOnSwipe: true,
    delta: 10, // min distance(px) before a swipe starts
    trackTouch: true,
  });

  return (
    <div className="relative z-0 flex min-h-screen md:pt-16">
      {/* Mobile sidebar toggle with proper animation */}
      <AnimatePresence>
        {!showMobileSidebar && (
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
            className="fixed z-0 md:hidden"
          >
            <Button
              className="h-fit min-w-0 text-primary dark:text-brandPink p-2 bg-default-100/70 dark:bg-content1/70 dark:border dark:border-zinc-600 backdrop-blur-sm dark:border-l-transparent shadow-md dark:border-t-transparent rounded-tr-none -ml-1 rounded-l-none mt-2"
              onPress={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <IconList className="w-6 h-6" />
              Categories
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar overlay for mobile */}
      <div
        className={`fixed inset-0 z-30 bg-black bg-opacity-50 transition-opacity md:hidden ${
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar with swipe functionality */}
      <aside
        {...swipeHandlers}
        className={`fixed z-30 inset-y-0 left-0 w-64 transition-transform duration-300 transform bg-content1 border-r border-gray-200 dark:border-zinc-600 md:relative md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 mt-10 md:mt-0 overflow-y-auto h-full">
          {/* Close button inside sidebar */}
          <div className="flex justify-end mb-4 md:hidden">
            <Button
              variant="light"
              className="text-gray-500"
              onPress={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              <IconArrowBarLeft className="w-6 h-6" />
              Close
            </Button>
          </div>

          <nav>
            <ul className="space-y-3">
              {docsNavigation.map((doc) => (
                <li key={doc.slug}>
                  <Link
                    href={`/docs/${doc.slug}`}
                    className={`block ${
                      doc.slug === currentSlug
                        ? "font-semibold text-primary"
                        : "text-default-500 hover:primary"
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    {doc.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </aside>

      {/* Content with framer-motion animation */}
      <motion.main
        className="flex-1 p-4 md:p-8 overflow-auto max-w-4xl mx-auto pt-16 md:pt-0"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        key={currentSlug} // This forces re-animation when changing docs
      >
        <motion.div
          className="prose prose-a:text-secondary prose-a:no-underline prose-headings:text-primary max-w-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <ReactMarkdown rehypePlugins={remarkGfm}>{docContent}</ReactMarkdown>
        </motion.div>
      </motion.main>
    </div>
  );
};

export default DocumentationWrapper;