import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

// This configures a Service Worker with the given request handlers.
export const worker = setupWorker(...handlers);

// Start the worker when this module is imported
if (
  typeof window !== "undefined" &&
  process.env.NEXT_PUBLIC_ENABLE_MSW === "true"
) {
  worker
    .start({
      onUnhandledRequest: "warn",
      serviceWorker: {
        url: "/mockServiceWorker.js",
      },
    })
    .then(() => {})
    .catch((error) => {});
}
