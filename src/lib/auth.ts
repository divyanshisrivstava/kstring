const KIIT_DOMAIN = "@kiit.ac.in";

export const isKiitEmail = (email?: string | null) =>
  Boolean(email && email.toLowerCase().trim().endsWith(KIIT_DOMAIN));

export const getInvalidDomainMessage = () =>
  "Only KIIT University email addresses ending with @kiit.ac.in can access KIIT Connect.";
