export type Lang = "en" | "fr";

export const translations = {
  en: {
    // Landing
    tagline: "Share your event. Fans save it to their calendar in one tap.",
    cta: "Create event →",
    by: "Mindful Machine",

    // New event form
    newEvent: "New event",
    eventName: "Event name",
    eventNamePlaceholder: "Live Q&A, Album drop, Fan meetup…",
    date: "Date",
    time: "Time",
    duration: "Duration",
    timezone: "Timezone",
    location: "Location",
    locationPlaceholder: "Paris, Madison Square Garden…",
    links: "Links",
    optional: "optional",
    creating: "Creating…",
    createLink: "Create link →",
    linkReady: "Link ready",
    open: "Open",
    copyLink: "Copy link",

    // Validation
    needLocationOrLink: "Add a location or at least one link to continue.",

    // Event page
    addToApple: "Apple / Outlook",
    addToGoogle: "Google Calendar",
    eventNotFound: "Event not found",
    eventNotFoundDesc: "This link may have expired or never existed.",
    backToHome: "← Back to Pindate",
    instagramHint: "Tap ··· in the top-right corner\nthen Open in Safari → tap this button again",
  },
  fr: {
    // Landing
    tagline: "Partagez votre événement. Vos fans l'ajoutent à leur agenda en un tap.",
    cta: "Créer un événement →",
    by: "Mindful Machine",

    // New event form
    newEvent: "Nouvel événement",
    eventName: "Nom de l'événement",
    eventNamePlaceholder: "Live Q&A, Sortie d'album, Meetup fans…",
    date: "Date",
    time: "Heure",
    duration: "Durée",
    timezone: "Fuseau horaire",
    location: "Lieu",
    locationPlaceholder: "Paris, Zénith, Accor Arena…",
    links: "Liens",
    optional: "optionnel",
    creating: "Création…",
    createLink: "Créer le lien →",
    linkReady: "Lien prêt",
    open: "Ouvrir",
    copyLink: "Copier le lien",

    // Validation
    needLocationOrLink: "Ajoutez un lieu ou au moins un lien pour continuer.",

    // Event page
    addToApple: "Apple / Outlook",
    addToGoogle: "Google Agenda",
    eventNotFound: "Événement introuvable",
    eventNotFoundDesc: "Ce lien a peut-être expiré ou n'existe pas.",
    backToHome: "← Retour à Pindate",
    instagramHint: "Appuyez sur ··· en haut à droite\npuis Ouvrir dans Safari → appuyez à nouveau sur ce bouton",
  },
} satisfies Record<Lang, Record<string, string>>;

export type TKey = keyof typeof translations.en;
