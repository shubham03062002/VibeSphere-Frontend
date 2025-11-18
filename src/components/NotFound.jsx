import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * NotFound page
 * - Shows a friendly 404 message
 * - Counts down from 5 and redirects to /login
 * - Provides a button to go to login immediately
 *
 * Usage:
 * <Route path="*" element={<NotFound />} />
 */
export default function NotFound() {
  const navigate = useNavigate();
  const [count, setCount] = useState(5);

  useEffect(() => {
    // Start countdown
    const timer = setInterval(() => {
      setCount((c) => c - 1);
    }, 1000);

    // Redirect when countdown finishes
    const redirect = setTimeout(() => {
      navigate("/login", { replace: true });
    }, 5000);

    return () => {
      clearInterval(timer);
      clearTimeout(redirect);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 text-white p-4">
      <div className="max-w-xl w-full bg-black/60 rounded-2xl p-8 text-center shadow-xl">
        <h1 className="text-5xl font-extrabold mb-2">404</h1>
        <p className="text-xl mb-4">Page not found</p>
        <p className="text-sm text-gray-300 mb-6">
          You will be redirected to the login page in <span className="font-semibold">{count}</span> second{count === 1 ? "" : "s"}.
        </p>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => navigate("/login", { replace: true })}
            className="px-5 py-2 bg-teal-500 hover:bg-teal-600 rounded-full font-semibold text-black"
          >
            Go to Login now
          </button>

          <button
            onClick={() => navigate("/", { replace: true })}
            className="px-5 py-2 bg-gray-700 hover:bg-gray-600 rounded-full font-medium text-gray-200"
          >
            Go to Home
          </button>
        </div>
      </div>
    </div>
  );
}