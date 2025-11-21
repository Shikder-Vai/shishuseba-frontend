import React from "react";
import { Link } from "react-router-dom";

const AccessDeniedPage = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold text-red-500">Access Denied</h1>
      <p className="text-lg text-gray-600">
        You do not have permission to access this page.
      </p>
      <Link to="/" className="mt-4 text-blue-500 hover:underline">
        Go to Home
      </Link>
    </div>
  );
};

export default AccessDeniedPage;
