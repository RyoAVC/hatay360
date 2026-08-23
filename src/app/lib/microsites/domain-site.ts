/** Hostname → microsite slug (özel alan adları). */
const DOMAIN_SLUG: Record<string, string> = {
  "taxireyhanli.com": "taxireyhanli",
  "www.taxireyhanli.com": "taxireyhanli",
};

export function micrositeSlugFromHostname(hostname = ""): string | null {
  const host = String(hostname || "")
    .toLowerCase()
    .split(":")[0]
    .trim();
  return DOMAIN_SLUG[host] || null;
}

export function isManagedDomainHost(hostname = ""): boolean {
  return micrositeSlugFromHostname(hostname) !== null;
}
