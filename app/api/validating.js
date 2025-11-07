// ✅ Drop this into any Next.js Node.js API Route or utils file
import { Resolver } from 'node:dns/promises';
import ipaddr from 'ipaddr.js';

const SAFE_PROTOCOLS = new Set(['http:', 'https:']);
const ALLOWED_CT = [/^text\/html/i, /^image\//i, /^video\//i];
const MAX_CONTENT_LENGTH = 10 * 1024 * 1024; // 10 MB
const resolver = new Resolver();
resolver.setServers(['1.1.1.1','8.8.8.8']);  // Cloudflare + Google DNS

function isPrivateOrSpecial(ip) {
  try {
    const addr = ipaddr.parse(ip);
    // Blocks private, reserved, loopback, etc.
    return addr.range() !== 'unicast';
  } catch {
    return true;
  }
}

async function resolveHost(hostname) {
  const ips = new Set();
  try { (await resolver.resolve4(hostname)).forEach((ip) => ips.add(ip)); } catch {}
  try { (await resolver.resolve6(hostname)).forEach((ip) => ips.add(ip)); } catch {}
  return [...ips];
}

async function validateExternalUrl(rawUrl) {
  // 1) Parse & basic protocol check
  let urlObj;
  try {
    urlObj = new URL(rawUrl.trim());
  } catch {
    return { ok: false, error: "Invalid URL format" };
  }

  if (!SAFE_PROTOCOLS.has(urlObj.protocol)) {
    return { ok: false, error: "Only http/https URLs allowed" };
  }

  // 2) Block raw IP hosts (e.g., http://192.168.1.5/)
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(urlObj.hostname)) {
    return { ok: false, error: "IP addresses are not allowed" };
  }

  // 3) DNS resolution -> block private/loopback/reserved networks
  const ips = await resolveHost(urlObj.hostname);
  if (ips.length === 0) {
    return { ok: false, error: "Host did not resolve" };
  }

  if (ips.some(isPrivateOrSpecial)) {
    return { ok: false, error: "Unsafe host (private/reserved address)" };
  }

  // 4) HEAD probe with timeout
  let res;
  try {
    res = await fetch(urlObj.toString(), {
      method: "HEAD",
      redirect: "manual",
      signal: AbortSignal.timeout(5000)  // 5s timeout
    });
  } catch {
    return { ok: false, error: "Failed to connect to the website" };
  }

  // 5) Follow up to 2 redirects manually
  let finalRes = res;
  let hops = 0;

  while ([301,302,303,307,308].includes(finalRes.status) && hops < 2) {
    const loc = finalRes.headers.get("location");
    if (!loc) break;

    const nextUrl = new URL(loc, urlObj);
    try {
      finalRes = await fetch(nextUrl, {
        method: "HEAD",
        redirect: "manual",
        signal: AbortSignal.timeout(5000)
      });
      urlObj = nextUrl;
      hops++;
    } catch {
      return { ok: false, error: "Failed following redirect" };
    }
  }

  if (finalRes.status >= 400) {
    return { ok: false, error: `Remote site returned status ${finalRes.status}` };
  }

  // 6) Content-Type allowlist
  const ct = finalRes.headers.get("content-type") || "";
  const allowed = ALLOWED_CT.some((rx) => rx.test(ct));
  if (!allowed) {
    return { ok: false, error: `Unsupported content-type: ${ct}` };
  }

  // 7) Content-Length limit
  const cl = parseInt(finalRes.headers.get("content-length") || "0", 10);
  if (cl > MAX_CONTENT_LENGTH) {
    return { ok: false, error: "Content too large" };
  }

  // ✅ PASSED ALL CHECKS
  return { ok: true };
}

// ✅ Export if needed
export { validateExternalUrl };
