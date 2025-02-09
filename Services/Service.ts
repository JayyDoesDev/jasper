import { Nullable } from '../Common/types';
import { Context } from '../Source/Context';
import { Store } from '../Source/Store';

export type CommonCondition<R> =
    R extends Nullable<string | number | boolean> ? R : R extends object ? Nullable<R> : void;

interface IService {
    configure<T>(config: T): this | Promise<this>;
    itemExists?<T>(exists?: T): CommonCondition<boolean> | Promise<CommonCondition<boolean>>;
    getValues?<T, R>(get?: T): CommonCondition<R> | Promise<CommonCondition<R>>;
    create?<T, R>(create?: T): Promise<CommonCondition<R>> | CommonCondition<R>;
    modify?<T, R>(mod?: T): Promise<CommonCondition<R>> | CommonCondition<R>;
    getMultiValues?<T, R>(
        getMultiValues?: T,
    ):
        | CommonCondition<R extends R[] ? R[] : R extends null | undefined ? [] : R[]>
        | Promise<CommonCondition<R>>;
    deleteValue?<T, R>(d?: T): Promise<CommonCondition<R>> | CommonCondition<R>;
}

export abstract class Service implements IService {
    protected store: Store;

    constructor(public readonly ctx: Context) {
        this.store = ctx.store;
    }

    public abstract configure<T>(config: T): this | Promise<this>;

    public itemExists?<T>(exists?: T): CommonCondition<boolean> | Promise<CommonCondition<boolean>>;
    public getValues?<T, R>(get?: T): CommonCondition<R> | Promise<CommonCondition<R>>;
    public create?<T, R>(create?: T): Promise<CommonCondition<R>> | CommonCondition<R>;
    public modify?<T, R>(mod?: T): Promise<CommonCondition<R>> | CommonCondition<R>;
    public getMultiValues?<T, R>(
        getMultiValues?: T,
    ):
        | CommonCondition<R extends R[] ? R[] : R extends null | undefined ? [] : R[]>
        | Promise<CommonCondition<R>>;
    public deleteValue?<T, R>(d?: T): Promise<CommonCondition<R>> | CommonCondition<R>;
}
