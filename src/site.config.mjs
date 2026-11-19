// Site-wide settings. Change contact details and the domain here only.
export const SITE = {
  name: 'Salgotra Capital',
  tagline: 'Permanent capital for enduring businesses.',
  location: 'Jammu & Kashmir, India',

  // Public domain, used for canonical URLs, the sitemap and social previews.
  domain: 'https://salgotracapital.com',

  // Directors' email addresses
  contacts: [
    { name: 'Harman Salgotra', email: 'harman@salgotracapital.com' },
    { name: 'Deepanshu Singh', email: 'deepanshu@salgotracapital.com' },
  ],
  privacyEmail: 'harman@salgotracapital.com',

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
