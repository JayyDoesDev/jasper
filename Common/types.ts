export type Combine<T extends Nullable<boolean | number | Object | string>[]> = T extends [
    infer F,
    ...infer R,
]
    ? Combine<R> & F
    : unknown;

export type Nullable<T> = T extends null ? T : null | T;

export function hasProperties<O extends object, K extends keyof O>(obj: O, keys: K[]): obj is O {
    return keys.every((key) => key in obj);
}
