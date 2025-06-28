import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-purple-100">
      <div className="bg-white rounded-xl shadow-lg p-10 max-w-md w-full text-center">
        <h1 className="text-6xl font-extrabold text-purple-600 mb-4 drop-shadow-lg">
          404
        </h1>
        <p className="text-2xl text-gray-700 mb-6 font-medium">
          Oops! Page not found
        </p>
        <a
          href="/"
          className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg shadow hover:bg-purple-700 transition-colors font-semibold"
        >
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
