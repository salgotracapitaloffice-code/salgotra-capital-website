// Site-wide settings. Change contact details and the domain here only.
export const SITE = {
  name: 'Salgotra Capital',
  tagline: 'Permanent capital for enduring businesses.',
  location: 'Jammu & Kashmir, India',

  // Public domain, used for canonical URLs, the sitemap and social previews.
  domain: 'https://salgotracapital.com',

  // Email addresses
  // contactEmail is the only address shown on the site (footer, Contact page,
  // and every "please email us" fallback). It reaches both directors.
  contactEmail: 'contact@salgotracapital.com',
  // Shown in the privacy policy for data requests
  privacyEmail: 'privacy@salgotracapital.com',
  // Directors' personal addresses: kept here for reference, not shown on the site
  directors: [
    { name: 'Harman Salgotra', email: 'harman@salgotracapital.com' },
    { name: 'Deepanshu Singh', email: 'deepanshu@salgotracapital.com' },
  ],

  // PHONE: leave empty to hide the phone line everywhere.
  // Example: '+91 98765 43210'
  PHONE: '',

  // Contact form. With Netlify Forms the endpoint is the page itself ('/contact/').
  // If you host elsewhere, put a Formspree URL here, e.g. 'https://formspree.io/f/xxxxxxx'.
  form: {
    name: 'contact',
    endpoint: '/contact/',
    provider: 'netlify', // 'netlify' or 'formspree'
  },
};
