import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";
import { IconSquareRoundedX } from "@tabler/icons-react";
import ReactMarkdown from "react-markdown";
import withColorCode from "@/lib/utils/with-color-dots";

const CodeWithColor = withColorCode("code");
const LiWithColor = withColorCode("li");
const PWithColor = withColorCode("p");
const EMWithColor = withColorCode("em");
const StrongWithColor = withColorCode("strong");

export default function MarkdownModalViewer({
  mdContent,
  isOpen,
  onOpenChange,
  onClose,
  title,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      hideCloseButton={true}
      className="inset-0 flex items-center justify-center p-4 right-1/2"
    >
      <ModalContent className="w-full max-w-5xl h-[85vh] max-h-screen rounded-lg shadow-lg flex flex-col">
        <ModalHeader className="absolute top-0 justify-center bg-primary/50 backdrop-blur-sm rounded-b-lg p-4 w-1/2">
          <h2 className="font-semibold text-xl text-center w-full flex items-center justify-center">
            {title || "Generated Plan"}
          </h2>
          <Button className="hover:bg-default-200" onPress={onClose}>
            <IconSquareRoundedX size={34} className="" />{" "}
          </Button>
        </ModalHeader>
        <ModalBody className="overflow-auto p-6 w-full mt-5 pt-16">
          <div className="prose lg:prose-lg prose-slate dark:prose-invert flex flex-col min-w-full">
            <ReactMarkdown
              components={{
                code: CodeWithColor, // Apply color dots inside <code> blocks
                li: LiWithColor, // Apply color dots inside list items
                p: PWithColor, // Apply color dots inside paragraphs
                em: EMWithColor, // Apply color dots inside <em> tags
                strong: StrongWithColor, // Apply color dots inside <strong> tags
              }}
            >
              {mdContent}
            </ReactMarkdown>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
