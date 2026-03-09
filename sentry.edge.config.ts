import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://0c95885d5d72745d57952539419a2801@o4508468655685632.ingest.us.sentry.io/4511017133080576",

  // Performance: capture 100% in dev, 10% in prod
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,
});
