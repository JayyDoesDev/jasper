export type Combine<T extends any[]> = T extends [infer F, ...infer R] ? F & Combine<R> : unknown;
