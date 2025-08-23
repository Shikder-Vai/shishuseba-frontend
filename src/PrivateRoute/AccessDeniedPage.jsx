import { useAuth } from "../main";
import { motion } from "framer-motion";
import { AlertTriangle, ShieldOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AccessDeniedPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } },
  };

  // Button styles matching your brand
  const buttonBase = "px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
  const grayButton = `${buttonBase} bg-brand-gray-light hover:bg-brand-gray-base text-brand-gray-dark focus:ring-brand-gray-light`;
  const tealButton = `${buttonBase} bg-brand-teal-base hover:bg-brand-teal-500 text-white focus:ring-brand-teal-100`;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="min-h-screen flex items-center justify-center bg-brand-cream p-6"
    >
      <div className="max-w-md w-full bg-white rounded-xl shadow-soft p-8 text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
          <ShieldOff className="h-8 w-8 text-red-600" />
        </div>
        
        <h2 className="text-2xl font-bold text-brand-teal-500 mb-2">
          Access Restricted
        </h2>
        
        <p className="text-brand-gray-base mb-6">
          {user?.role === "moderator"
            ? "Your moderator account doesn't have permission to access this page."
            : "You need higher privileges to access this content."}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className={grayButton}
          >
            Go Back
          </button>
          <button
            onClick={() => navigate("/")}
            className={tealButton}
          >
            Return Home
          </button>
        </div>

        {user?.role === "moderator" && (
          <div className="mt-8 p-4 bg-brand-orange-light rounded-lg border border-brand-orange-base/20 text-left">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-brand-orange-base mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-brand-gray-base mb-1">
                  Need Admin Access?
                </h4>
                <p className="text-sm text-brand-gray-base">
                  Contact your system administrator to request elevated privileges
                  for this functionality.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AccessDeniedPage;