export interface MemoizePayload {
  // Determine a unique id for the provided arguments set
  extractUniqueId: (...args: any[]) => any;
  // Set timeout to clear it content of the map
  clearCacheTimeout?: number;
  // For debug purposes you can pass an extra function for logging all actions
  debugReporter?: (message: string, state?: Map<any, unknown> | unknown) => void;
}
