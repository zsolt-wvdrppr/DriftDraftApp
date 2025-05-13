import {
    IconReorder,
    IconTrash,
    IconEye,
    IconMessageDollar,
    IconDownload
  } from "@tabler/icons-react";

export const legend = () => {
    return (
      <div className="relative z-0 p-4 rounded-lg dark:bg-zinc-700 flex flex-col gap-2 font-semibold">
        <p className="text-medium font-bold text-zinc-400 pb-2 tracking-wider">Legend</p>
        <p className="flex gap-2">
          <IconReorder className="text-highlightPurple" /> - Review Questionnaire
        </p>
        <p className="flex gap-2">
          <IconTrash className="text-accentRed"/> - Delete
        </p>
        <p className="flex gap-2">
          <IconDownload className="text-accentMint"/> - Download as PDF
        </p>
        <p className="flex gap-2">
          <IconEye className="text-lime-500"/> - View & Edit plan
        </p>
        <p className="flex gap-2">
          <IconMessageDollar className="text-highlightOrange" /> - Get Quote
        </p>
      </div>
    );
  };