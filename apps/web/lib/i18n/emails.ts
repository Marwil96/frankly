export const emailStrings = {
  en: {
    subject: "How's your {productName}?",
    greeting: "Hi {name},",
    body: "We'd love to hear what you think about your recent purchase.",
    cta: "Tap a star to leave a review",
    unsubscribe: "Unsubscribe from review emails",
    reminderSubject: "Quick reminder: share your thoughts on {productName}",
    reminderBody:
      "We noticed you haven't reviewed your {productName} yet. Your feedback helps other customers.",
  },
  sv: {
    subject: "Vad tycker du om din {productName}?",
    greeting: "Hej {name},",
    body: "Vi vill gärna höra vad du tycker om ditt senaste köp.",
    cta: "Tryck på en stjärna för att lämna en recension",
    unsubscribe: "Avsluta prenumeration på recensionsmail",
    reminderSubject: "Påminnelse: dela dina tankar om {productName}",
    reminderBody:
      "Vi såg att du inte har recenserat din {productName} ännu. Din feedback hjälper andra kunder.",
  },
  nb: {
    subject: "Hva synes du om din {productName}?",
    greeting: "Hei {name},",
    body: "Vi vil gjerne høre hva du synes om ditt nylige kjøp.",
    cta: "Trykk på en stjerne for å skrive en anmeldelse",
    unsubscribe: "Avslutt abonnement på anmeldelsesmailer",
    reminderSubject: "Påminnelse: del dine tanker om {productName}",
    reminderBody:
      "Vi la merke til at du ikke har anmeldt din {productName} ennå. Din tilbakemelding hjelper andre kunder.",
  },
  da: {
    subject: "Hvad synes du om din {productName}?",
    greeting: "Hej {name},",
    body: "Vi vil gerne høre, hvad du synes om dit seneste køb.",
    cta: "Tryk på en stjerne for at skrive en anmeldelse",
    unsubscribe: "Afmeld anmeldelsesmails",
    reminderSubject: "Påmindelse: del dine tanker om {productName}",
    reminderBody:
      "Vi har bemærket, at du endnu ikke har anmeldt din {productName}. Din feedback hjælper andre kunder.",
  },
} as const;

export type Locale = keyof typeof emailStrings;

export function t(
  locale: string,
  key: keyof (typeof emailStrings)["en"],
  vars?: Record<string, string>,
) {
  const l = (locale in emailStrings ? locale : "en") as Locale;
  let str: string = emailStrings[l][key];
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      str = str.replace(`{${k}}`, v);
    }
  }
  return str;
}
