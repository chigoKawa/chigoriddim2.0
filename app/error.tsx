"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { AlertTriangle, RotateCcw, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-lg w-full text-center"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mx-auto mb-8 w-24 h-24 rounded-full bg-destructive/10 flex items-center justify-center"
        >
          <AlertTriangle className="w-12 h-12 text-destructive" />
        </motion.div>

        {/* Error Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h1 className="text-2xl font-semibold text-foreground mb-3">
            Something went wrong
          </h1>
          <p className="text-muted-foreground mb-4 max-w-md mx-auto">
            {error?.message ||
              "An unexpected error occurred while loading this page."}
          </p>
          {error?.digest && (
            <p className="text-xs text-muted-foreground/60 font-mono mb-6">
              Error ID: {error.digest}
            </p>
          )}
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap gap-3 justify-center"
        >
          <Button onClick={() => reset()} size="lg">
            <RotateCcw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            size="lg"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reload Page
          </Button>
          <Button asChild variant="ghost" size="lg">
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Link>
          </Button>
        </motion.div>

        {/* Help text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-8 text-sm text-muted-foreground"
        >
          If this problem persists, please contact support.
        </motion.p>
      </motion.div>
    </div>
  );
}
