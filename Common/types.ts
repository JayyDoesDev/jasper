export type Nullable<T> = T extends null ? T : T | null;

export type Combine<
  T extends Nullable<string | number | boolean | Object>[]>
  = T extends [infer F, ...infer R]
  ? F & Combine<R> : unknown;

export function hasProperties<O extends object, K extends keyof O>(obj: O, keys: K[]): obj is O {
  return keys.every(key => key in obj);
}

