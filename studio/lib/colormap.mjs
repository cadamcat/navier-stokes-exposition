/* ES module facade. Load lib/colormap.js first so the classic script
   publishes globalThis.Colormap, then import the bindings from here. */
const api = globalThis.Colormap;
if (!api) throw new Error("load lib/colormap.js before this module");

export const makeMap = api.makeMap;
export const magnitudeMap = api.magnitudeMap;
export const signedMap = api.signedMap;
export const paintGeometry = api.paintGeometry;
export const paintSVG = api.paintSVG;
export const simulateCVD = api.simulateCVD;
export const deltaE = api.deltaE;
export const endMiddleGaps = api.endMiddleGaps;
export default api;
