import { redirect } from "next/navigation";
import { headers } from "next/headers";

export default async function RootPage() {
  // Get browser language preference
  const headersList = await headers();
  const acceptLanguage = headersList.get("accept-language") || "";

  // Simple language detection - check if Spanish is preferred
  const preferredLocale = acceptLanguage.toLowerCase().includes("es")
    ? "es"
    : "en";

  // Redirect to dashboard with detected locale
  redirect(`/${preferredLocale}/dashboard`);
}
