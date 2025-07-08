// Utility function to get the correct asset path for both dev and production
export const getAssetPath = (assetPath: string): string => {
  // In development, use the asset path as-is
  // In production (GitHub Pages), prepend the base URL
  const baseUrl = (import.meta as any).env.MODE === 'development' ? '' : '/EpicenterMarketplace';
  return `${baseUrl}/assets/${assetPath}`;
}; 