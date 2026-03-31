export type MobileToGraphics =
  | { type: "INIT_SCENE"; payload: { scene: unknown } }
  | { type: "REQUEST_SNAPSHOT" }
  | { type: "UPDATE_PARAMS"; payload: Record<string, number | string | boolean> };

export type GraphicsToMobile =
  | { type: "READY" }
  | { type: "SNAPSHOT"; payload: unknown }
  | { type: "ERROR"; message: string };

export function toInjectedInitMessage(message: MobileToGraphics): string {
  return `
(function() {
  window.__VM_MOBILE_MSG = ${JSON.stringify(message)};
  if (window.__vmReceiveFromMobile) {
    window.__vmReceiveFromMobile(window.__VM_MOBILE_MSG);
  }
})();
`;
}
