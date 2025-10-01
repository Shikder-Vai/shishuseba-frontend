// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

const SectionTitle = ({ title, isDashboard }) => {
  if (isDashboard) {
    return <h1 className="text-3xl font-bold text-gray-800 mb-6">{title}</h1>;
  }

  return (
    <motion.div
      className="flex flex-col items-center py-2 px-4 relative"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-brand-teal-300/30 z-0" />
      <div className="relative z-10 px-6">
        <h2 className="text-center text-2xl md:text-4xl font-bold text-brand-teal-500 bg-white px-6 inline-block">
          {title}
        </h2>
      </div>
      {/* {subtitle && (
        <p className="text-brand-orange-base text-sm font-medium mt-2">
          {subtitle}
        </p>
      )} */}
    </motion.div>
  );
};

export default SectionTitle;
