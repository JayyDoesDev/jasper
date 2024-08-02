import { Nullable } from "../Common/Nullable";

export interface MOResponse {
    type: Nullable<StringConstructor | NumberConstructor | BooleanConstructor | []>
    d?: Nullable<string | number | Nullable<undefined>[]>,
    required?: boolean;
}

export function MO(
    type: StringConstructor | NumberConstructor | BooleanConstructor | [],
    d?: Nullable<string | number | Nullable<undefined>[]>,
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

