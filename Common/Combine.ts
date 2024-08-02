import { Nullable } from "./Nullable";

export type Combine<T extends Nullable<string | number | boolean | Object>[]> = T extends [infer F, ...infer R] ? F & Combine<R> : unknown;
