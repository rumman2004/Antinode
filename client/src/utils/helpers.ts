export const safeDecode = (str: string) => {
  if (!str) return '';
  try {
    return decodeURIComponent(str);
  } catch (e) {
    // Fallback if decodeURIComponent fails (e.g. malformed URI sequence)
    return str.replace(/%20/g, ' ');
  }
};
