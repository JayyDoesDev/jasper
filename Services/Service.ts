import { Nullable } from "../Common/types";
import { Context } from "../Source/Context";
import { Store } from "../Source/Store";

export type CommonCondition<R> =
    R extends Nullable<string | number | boolean>
    ? R
    : R extends object
    ? Nullable<R>
    : void;

interface IService {
    configure<T>(config: T): ThisParameterType<this>;
    itemExists<T>(exists?: T): CommonCondition<boolean> | Promise<CommonCondition<boolean>>;
    getValues<T, R>(get?: T): CommonCondition<R> | Promise<CommonCondition<R>>;
    create<T, R>(create?: T): Promise<CommonCondition<R>> | CommonCondition<R>;
    modify<T, R>(mod?: T): Promise<CommonCondition<R>> | CommonCondition<R>;
    getMultiValues<T, R>(getMultiValues?: T):
        CommonCondition<
            R extends R[] ? R[] :
            R extends null | undefined ? [] : R[]
        > | Promise<CommonCondition<R>>;
    deleteValue<T, R>(d: T): Promise<CommonCondition<R>> | CommonCondition<R>;
}

export abstract class Service extends Store implements IService {
    constructor(public readonly ctx: Context) {
        super(ctx);
    }

    public abstract configure<T>(config: T): ThisParameterType<this>;
    public abstract itemExists<T>(exists?: T): CommonCondition<boolean> | Promise<CommonCondition<boolean>>;
    public abstract getValues<T, R>(get?: T): CommonCondition<R> | Promise<CommonCondition<R>>;
    public abstract create<T, R>(create?: T): Promise<CommonCondition<R>> | CommonCondition<R>;
    public abstract modify<T, R>(mod?: T): Promise<CommonCondition<R>> | CommonCondition<R>;
    public abstract getMultiValues<T, R>(getMultiValues?: T):
        CommonCondition<
            R extends R[] ? R[] :
            R extends null | undefined ? [] : R[]
        > | Promise<CommonCondition<R>>;
    public abstract deleteValue<T, R>(d?: T): Promise<CommonCondition<R>> | CommonCondition<R>;
}

