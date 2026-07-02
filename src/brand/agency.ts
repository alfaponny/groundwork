export const agency = {
  name: "Alfaponny Studio", // spots: session default, PDF author, spec prompt
  descriptor: "a Swedish digital product studio", // spot: spec prompt ("spec writer for X, <descriptor>")
  serviceEmail: "service@alfaponny.example", // spot: anonymous-session default contact
  salesEmail: process.env.SALES_EMAIL ?? "hello@alfaponny.example", // spots: email cc / replyTo
  defaultLocale: "sv" as const, // spot: session default locale
} as const;
