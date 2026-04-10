import { isRouteErrorResponse, useRouteError, useNavigate } from "react-router";
import { AlertTriangle, RefreshCw, Home, Bug } from "lucide-react";
import { useState } from "react";

export default function ErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();
  const [showStack, setShowStack] = useState(false);

  const isRouteError = isRouteErrorResponse(error);

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-xl w-full bg-white border border-slate-200 rounded-2xl shadow-lg p-8 text-center">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="bg-blue-100 p-4 rounded-full">
            <AlertTriangle className="text-blue-500 w-8 h-8" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-semibold text-slate-800 mb-2">
          {isRouteError
            ? `${error.status} ${error.statusText}`
            : "Something went wrong"}
        </h1>

        {/* Message */}
        <p className="text-slate-600 mb-6">
          {isRouteError
            ? error.data || "An unexpected error occurred."
            : error instanceof Error
              ? error.message
              : "Unknown error occurred."}
        </p>

        {/* Actions */}
        <div className="flex justify-center gap-3 mb-6">
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
          >
            <RefreshCw size={16} />
            Retry
          </button>

          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 border border-slate-300 text-slate-700 hover:bg-slate-100 px-4 py-2 rounded-lg transition"
          >
            <Home size={16} />
            Go Home
          </button>
        </div>

        {/* Stack Trace (Dev Only Feel) */}
        {error instanceof Error && error.stack && (
          <div className="text-left">
            <button
              onClick={() => setShowStack(!showStack)}
              className="flex items-center gap-2 text-sm text-blue-500 hover:underline mb-2"
            >
              <Bug size={14} />
              {showStack ? "Hide Details" : "Show Details"}
            </button>

            {showStack && (
              <pre className="bg-slate-900 text-slate-100 text-xs p-4 rounded-lg overflow-auto max-h-64">
                {error.stack}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
