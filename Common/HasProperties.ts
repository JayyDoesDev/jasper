/* eslint @typescript-eslint/no-explicit-any: "off" */
export function HasProperties<T>(obj: any, keys: (keyof T)[]): obj is T {
  return keys.every(key => key in obj);
}
