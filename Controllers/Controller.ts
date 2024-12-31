import { Nullable } from "../Common/Nullable";
import { Context } from "../Source/Context";
import { Store } from "../Source/Store";

export type CommonCondition<R> = 
    R extends Nullable<string | number | boolean>
        ? R
            : R extends object
                ? Nullable<R>
                    : void;

interface IController {
    configure<T>(config: T): ThisParameterType<this>;
    itemExists<T>(exists: T): CommonCondition<boolean> | Promise<CommonCondition<boolean>>;
    getValues<T, R>(get: T): CommonCondition<R> | Promise<CommonCondition<R>>;
    create<T, R>(create: T): Promise<CommonCondition<R>> | CommonCondition<R>;
    modify<T, R>(mod: T): Promise<CommonCondition<R>> | CommonCondition<R>;
    delete<T, R>(d: T): Promise<CommonCondition<R>> | CommonCondition<R>;
    getMultiValues<T, R extends Array<T>>(getMultiValues: T): Promise<CommonCondition<R>> | CommonCondition<R>;
}

export abstract class Controller extends Store implements IController {
    constructor(public readonly ctx: Context) {
        super(ctx);
        this.ctx = ctx;
    }
    
    public abstract configure<T>(config: T): ThisParameterType<this>;
    public abstract itemExists<T>(exists?: T): CommonCondition<boolean> | Promise<CommonCondition<boolean>>;
    public abstract getValues<T, R>(get?: T): CommonCondition<R> | Promise<CommonCondition<R>>;
    public abstract create<T, R>(create?: T): Promise<CommonCondition<R>> | CommonCondition<R>;
    public abstract modify<T, R>(mod?: T): Promise<CommonCondition<R>> | CommonCondition<R>;
    public abstract delete<T, R>(d?: T): Promise<CommonCondition<R>> | CommonCondition<R>;
    public abstract getMultiValues<T, R extends Array<T>>(getMultiValues?: T): Promise<CommonCondition<R>> | CommonCondition<R>;
}
