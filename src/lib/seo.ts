export const SITE_URL = "https://keithciceron.vercel.app";

// Default description (search results, LinkedIn/Messenger, X) so previews never disagree.
export const SITE_DESCRIPTION =
  "Full Stack Developer in Manila. Built a POS for Iconic Cards PH, a municipal portal for Cainta, and a realty site, plus 3+ years of QA at Opoli Technology.";

/**
 * Per-page title, description, canonical URL, and their Open Graph / Twitter twins.
 * The site-wide tags (og:image, twitter:card, …) stay in __root.tsx; tags set here override the root's.
 */
export function pageHead({
  path,
  title,
  description,
}: {
  path: string;
  title: string;
  description: string;
}) {
  const url = `${SITE_URL}${path}`;
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: url },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
    ],
    links: [{ rel: "canonical", href: url }],
  };
}
