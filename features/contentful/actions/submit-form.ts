"use server";

// Formspree form ID - get yours free at https://formspree.io
// Create a form, copy the form ID (e.g., "xyzabcde" from https://formspree.io/f/xyzabcde)
const FORMSPREE_FORM_ID = process.env.FORMSPREE_FORM_ID;

export interface FormSubmissionResult {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
}

export interface FormSubmissionPayload {
  /** The form slug used as identifier */
  formSlug: string;
  /** The form data submitted by the user */
  data: Record<string, unknown>;
  /** Optional tracking metadata */
  tracking?: {
    eventName?: string;
    meta?: Record<string, unknown>;
  };
  /** Optional submit configuration from the form schema */
  submitConfig?: {
    action?: string;
    method?: "POST";
  };
}

/**
 * Send email notification via Formspree (free: 50 submissions/month)
 * More reliable from server-side than Web3Forms
 */
async function sendEmailNotification(
  formSlug: string,
  data: Record<string, unknown>
): Promise<boolean> {
  console.log("[Form Submission] Attempting to send email notification...");
  console.log(
    "[Form Submission] FORMSPREE_FORM_ID exists:",
    !!FORMSPREE_FORM_ID
  );

  if (!FORMSPREE_FORM_ID) {
    console.warn(
      "[Form Submission] FORMSPREE_FORM_ID not set. " +
        "Get your free form ID at https://formspree.io and add it to .env.local"
    );
    return false;
  }

  try {
    const payload = {
      _subject: `New Form Submission: ${formSlug}`,
      _form_slug: formSlug,
      _submitted_at: new Date().toISOString(),
      ...data,
    };

    console.log("[Form Submission] Sending to Formspree...");

    const response = await fetch(
      `https://formspree.io/f/${FORMSPREE_FORM_ID}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    console.log("[Form Submission] Formspree status:", response.status);

    if (response.ok) {
      console.log(
        `[Form Submission] ✅ Email notification sent for ${formSlug}`
      );
      return true;
    } else {
      const errorText = await response.text();
      console.error(
        `[Form Submission] ❌ Formspree error:`,
        errorText.substring(0, 200)
      );
      return false;
    }
  } catch (error) {
    console.error(`[Form Submission] ❌ Email notification error:`, error);
    return false;
  }
}

/**
 * Server action to handle form submissions.
 * Takes the form slug as an identifier and the user-submitted data.
 *
 * You can customize this to:
 * - Store submissions in a database
 * - Send to a third-party service
 * - Forward to the action URL specified in the form schema
 * - Send email notifications
 */
export async function submitForm(
  payload: FormSubmissionPayload
): Promise<FormSubmissionResult> {
  const { formSlug, data, tracking, submitConfig } = payload;

  try {
    // Log the submission (replace with your actual storage/processing logic)
    console.log(`[Form Submission] Form: ${formSlug}`, {
      timestamp: new Date().toISOString(),
      data,
      tracking,
    });

    // If the form has a custom action URL, forward the submission there
    if (submitConfig?.action) {
      const response = await fetch(submitConfig.action, {
        method: submitConfig.method || "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          formSlug,
          data,
          submittedAt: new Date().toISOString(),
          ...tracking?.meta,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        console.error(
          `[Form Submission] External action failed for ${formSlug}:`,
          response.status,
          errorText
        );
        return {
          success: false,
          message: `Submission failed: ${response.status} ${response.statusText}`,
        };
      }

      // Try to parse response as JSON
      try {
        const responseData = await response.json();
        return {
          success: true,
          message:
            responseData.message ||
            "Thank you! Your submission has been received.",
          data: responseData,
        };
      } catch {
        // Response wasn't JSON, that's okay
        return {
          success: true,
          message: "Thank you! Your submission has been received.",
        };
      }
    }

    // Send email notification (non-blocking, don't fail submission if email fails)
    await sendEmailNotification(formSlug, data);

    return {
      success: true,
      message: "Thank you! Your submission has been received.",
      data: {
        formSlug,
        submittedAt: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error(`[Form Submission] Error for ${formSlug}:`, error);

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred. Please try again.",
    };
  }
}
