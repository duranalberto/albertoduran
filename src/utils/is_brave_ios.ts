export function isBraveIOS(): boolean {
  const ua = navigator.userAgent || "";

  const isIOS =
    /iPhone|iPad|iPod/.test(ua) ||
    (ua.includes("Mac") && "ontouchend" in document);

  const isBrave =
    (navigator as any).brave?.isBrave?.() !== undefined || ua.includes("Brave");

  return isIOS && isBrave;
}
