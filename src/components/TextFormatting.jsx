import React from "react";

/**
 * @param {{text: string}} props The props object.
 * @param {string} props.text The input string to format.
 * @returns {React.ReactElement} The formatted text as a React element.
 */
const FormattedText = ({ text }) => {
  if (typeof text !== "string") {
    return text;
  }

  // A regular expression to split the string by the formatting markers (*...* or **...**).

  const regex = /(\*\*.*?\*\*|\*.*?\*)/g;

  // --- Handle the initial "Title:" bolding ---
  // const colonIndex = text.indexOf(":");
  let initialTitlePart = null;
  let contentToParse = text;

  // Check if a colon exists and it's not the first character.
  /*
  if (colonIndex > 0) {
    const title = text.substring(0, colonIndex);

    contentToParse = text.substring(colonIndex + 1);

    initialTitlePart = (
      <strong className="font-semibold text-brand-teal-base">{title}:</strong>
    );
  }
  */

  const parts = contentToParse.split(regex).filter(Boolean);

  const renderedContent = parts.map((part, index) => {
    // Check for bullet points: **text**
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <div key={index} className="flex items-start pl-4">
          <span className="mr-2 text-brand-teal-base">&#8269;</span>
          <span>{part.substring(2, part.length - 2)}</span>
        </div>
      );
    }

    // Check for bold text: *text*
    if (part.startsWith("*") && part.endsWith("*")) {
      return (
        <strong key={index} className="font-semibold text-brand-teal-base">
          {part.substring(1, part.length - 1)}
        </strong>
      );
    }
    return <span key={index}>{part}</span>;
  });

  return (
    <div className="text-gray-700">
      {initialTitlePart}
      {renderedContent}
    </div>
  );
};
export default FormattedText;
