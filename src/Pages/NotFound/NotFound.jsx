import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-800">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-blue-500">404</h1>
        <p className="text-2xl md:text-3xl font-light mt-4">
          Oops! The page you're looking for doesn't exist.
        </p>
        <p className="mt-2 text-gray-600">
          You might have mistyped the address or the page may have moved.
        </p>
        <div className="mt-8">
          <Link
            to="/"
            className="px-6 py-3 text-lg font-semibold text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors duration-300"
          >
            Go back to Home
          </Link>
        </div>
      </div>
      <div className="mt-12 text-sm text-gray-500">
        <p>Shishu Seba</p>
      </div>
    </div>
  );
};

export default NotFound;
