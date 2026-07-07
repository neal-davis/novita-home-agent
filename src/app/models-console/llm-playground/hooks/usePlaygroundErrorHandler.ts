import { useEffect } from "react";
import { LLMErrReason } from "@/app/api/type";
import { NOVITA_URL } from "@/constants/urls";
import { notify } from "@/components/ui/standard/notify";

const DURATION = 3_000;

/**
 * Playground error handling hook
 */
export function usePlaygroundErrorHandler(error: Error | undefined) {
  useEffect(() => {
    if (!error) return;

    try {
      const errorMessage = error?.message;
      if (!errorMessage) return;

      // Try to parse the error message as JSON
      let errorData: { reason?: string; message?: string } = {};
      try {
        errorData = JSON.parse(errorMessage);
      } catch (parseError) {
        // If not JSON format, use error message directly
        notify.error("Error", {
          description: errorMessage,
        });
        return;
      }

      // Show the corresponding toast based on the different error reasons
      switch (errorData.reason) {
        case LLMErrReason.NOT_ENOUGH_BALANCE:
          notify.warning("Not enough balance", {
            description:
              "Not enough balance, please top up and continue using.",
            action: {
              label: "Top up",
              onClick: () => {
                window.location.href = NOVITA_URL.BILLING_OVERVIEW;
              },
            },
            duration: DURATION,
          });
          break;

        case LLMErrReason.MODEL_NOT_AVAILABLE:
          notify.error("Model not available", {
            id: "llm-playground-model-not-available",
            description: "Model not available now, please try again later.",
            duration: DURATION,
          });
          break;

        case LLMErrReason.FAILED_TO_AUTH:
          notify.error("Failed to authenticate", {
            description:
              "Failed to authenticate. Please check your API key and try again.",
            duration: DURATION,
          });
          break;

        case LLMErrReason.INTERNAL_SERVER_ERROR:
          notify.error("Internal server error", {
            description:
              errorData.message ||
              "Internal server error. Please check your API key and try again.",
            duration: DURATION,
          });
          break;

        default:
          notify.error("Error", {
            description: errorData.message || "An unexpected error occurred.",
            duration: DURATION,
          });
          break;
      }
    } catch (err) {
      console.error("Error handling error:", err);
      notify.error("Error", {
        description:
          "An unexpected error occurred. Please check your API key and try again.",
        duration: DURATION,
      });
    }
  }, [error]);
}
