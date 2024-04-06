export interface MOResponse {
  type: StringConstructor | NumberConstructor | BooleanConstructor | null | [];
  d?: string | number | boolean | any[];
  required?: boolean;
}
export function MO(type: StringConstructor, d?: string, required?: boolean): MOResponse;
export function MO(type: NumberConstructor, d?: number, required?: boolean): MOResponse;
export function MO(type: BooleanConstructor, d?: boolean, required?: boolean): MOResponse;
export function MO(type: null, d?: boolean, required?: boolean): MOResponse;
export function MO(type: [], d?: any[], required?: boolean): MOResponse;
export function MO(
  type: StringConstructor | NumberConstructor | BooleanConstructor | [],
  d?: string | number | boolean | null | any[],
  required?: boolean
): MOResponse {
  const obj: MOResponse = { type };
  if (!type) {
    throw new ReferenceError("Type required for mongodb schema prop.");
  }

  if (d !== undefined) {
    obj.d = d;
  }

  if (required !== undefined) {
    obj.required = required;
  }

  return obj;
}

