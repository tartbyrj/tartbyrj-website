/**
 * Outward-facing contact points for the studio.
 *
 * Deliberately NOT a Sanity singleton. ARCHITECTURE.md §5 sketches a
 * `siteSettings` document with these fields, but that schema was never
 * registered — and registering one now would buy nothing for values that
 * change roughly never, at the cost of a fetch, a Zod schema, a fallback path
 * and a failure mode on every page that renders the footer. Git is the right
 * store for values that ship with the code.
 *
 * This module is the single source of truth. The footer (Layout.astro) and the
 * Contact page both read from here. Nothing else should hardcode these — the
 * Contact page's Instagram link has already drifted once, when the footer and
 * the page held separate copies.
 */

export interface SiteContact {
  /** mailto: target for the footer and the Contact page. */
  readonly email: string;
}

export const siteContact: SiteContact = {
  // TODO(RJ): PLACEHOLDER — replace with the real studio address before the
  // custom domain goes live. Rendered verbatim as link text in the footer.
  email: 'hello@tartbyrj.com',
};

/**
 * Social profile links, driving the footer icon row (and the Contact page's
 * Instagram CTA, looked up by `icon`). Adding a network — Facebook, WhatsApp,
 * whatever comes next — is one entry here plus one matching SVG path set in
 * the `socialIcons` registry next to `.footer-social` in Layout.astro; no
 * markup in the footer itself changes. `icon` is the join key between the two.
 */
export interface SocialLink {
  readonly label: string;
  readonly href: string;
  readonly icon: 'instagram' | 'behance';
}

export const SOCIALS: SocialLink[] = [
  { label: 'Instagram', href: 'https://www.instagram.com/TARTBYRJ/', icon: 'instagram' },
  // TODO(RJ): PLACEHOLDER — replace with the real Behance profile URL.
  { label: 'Behance', href: 'https://www.behance.net/tartbyrj', icon: 'behance' },
];
