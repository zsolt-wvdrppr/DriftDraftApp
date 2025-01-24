import {
    IconReorder,
    IconTrash,
    IconEye,
    IconMessageDollar,
    IconDownload
  } from "@tabler/icons-react";

export const legend = () => {
    return (
      <div className="p-4 w-fit rounded-lg dark:bg-zinc-800 flex flex-col gap-2">
        <p className="flex gap-2">
          <IconReorder /> - Review Questionnaire
        </p>
        <p className="flex gap-2">
          <IconTrash /> - Delete
        </p>
        <p className="flex gap-2">
          <IconDownload /> - Download as PDF
        </p>
        <p className="flex gap-2">
          <IconEye /> - View & Edit plan
        </p>
        <p className="flex gap-2">
          <IconMessageDollar /> - Get Quote
        </p>
      </div>
    );
  };