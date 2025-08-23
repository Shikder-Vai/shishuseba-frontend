import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useAuth } from "../main";
import { Mail, Lock } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localLoading, setLocalLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalLoading(true);

    try {
      await login(email, password);

      Swal.fire({
        position: "center",
        icon: "success",
        title: "Login Successful",
        showConfirmButton: false,
        timer: 1500,
        background: "#feefe0",
        color: "#015d4f",
      }).then(() => {
        navigate("/dashboard");
      });
    } catch (error) {
      console.log(error);
      Swal.fire({
        position: "center",
        icon: "error",
        title:
          error.response?.data?.message ||
          error.message ||
          "Invalid Credentials",
        showConfirmButton: false,
        timer: 1500,
        background: "#feefe0",
        color: "#015d4f",
      });
    } finally {
      setLocalLoading(false);
    }
  };

  const isLoading = localLoading;

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-cream p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-soft overflow-hidden border border-brand-gray-light">
        {/* Header with brand gradient */}
        <div className="bg-gradient-to-r from-brand-teal-400 to-brand-teal-500 p-6 text-center">
          <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
          <p className="text-brand-cream mt-1">Login to access your account</p>
        </div>

        <div className="p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-brand-teal-500 font-medium flex items-center">
                <Mail className="w-4 h-4 mr-2" />
                Email Address
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                className="input w-full border-brand-gray-light focus:border-brand-teal-300 focus:ring-2 focus:ring-brand-teal-100"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                autoComplete="email"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-brand-teal-500 font-medium flex items-center">
                <Lock className="w-4 h-4 mr-2" />
                Password
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                className="input w-full border-brand-gray-light focus:border-brand-teal-300 focus:ring-2 focus:ring-brand-teal-100"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                autoComplete="current-password"
              />
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  className="h-4 w-4 text-brand-teal-500 focus:ring-brand-teal-300 border-brand-gray-light rounded"
                  disabled={isLoading}
                />
                <label
                  htmlFor="remember"
                  className="ml-2 block text-sm text-brand-gray-base"
                >
                  Remember me
                </label>
              </div>
              <a
                href="/forgot-password"
                className="text-sm text-brand-teal-500 hover:text-brand-teal-400"
              >
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all ${
                isLoading
                  ? "bg-brand-teal-300 cursor-not-allowed"
                  : "bg-brand-teal-500 hover:bg-brand-teal-400 shadow-md hover:shadow-soft"
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Logging in...
                </span>
              ) : (
                "Log In"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-brand-gray-light"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-brand-gray-base">
                Or continue with
              </span>
            </div>
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              disabled={isLoading}
              className="w-full inline-flex justify-center items-center py-2 px-4 border border-brand-gray-light rounded-lg shadow-sm text-sm font-medium text-brand-gray-base bg-white hover:bg-brand-gray-light focus:outline-none disabled:opacity-50"
            >
              {/* GitHub SVG */}
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 0C4.477 0 0 4.477 0 10c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0110 4.844c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.933.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C17.14 18.163 20 14.418 20 10c0-5.523-4.477-10-10-10z"
                  clipRule="evenodd"
                />
              </svg>
              GitHub
            </button>
            <button
              type="button"
              disabled={isLoading}
              className="w-full inline-flex justify-center items-center py-2 px-4 border border-brand-gray-light rounded-lg shadow-sm text-sm font-medium text-brand-gray-base bg-white hover:bg-brand-gray-light focus:outline-none disabled:opacity-50"
            >
              {/* Twitter SVG */}
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
              </svg>
              Twitter
            </button>
          </div>

          {/* Sign Up Link */}
          <p className="mt-6 text-center text-sm text-brand-gray-base">
            Don't have an account?{" "}
            <a
              href="/register"
              className="font-medium text-brand-teal-500 hover:text-brand-teal-400"
            >
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
