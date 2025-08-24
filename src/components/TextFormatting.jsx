const BoldColonText = ({ text }) => {
  if (typeof text !== "string") {
    return text;
  }

  const colonIndex = text.indexOf(":");

  if (colonIndex > 0) {
    const title = text.substring(0, colonIndex);
    const restOfString = text.substring(colonIndex + 1);

    return (
      <>
        <strong className="text-brand-teal-base">{title}:</strong>
        {restOfString}
      </>
    );
  }

  return text;
};
export default BoldColonText;
