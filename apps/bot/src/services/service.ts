import { Context } from '../classes/context';
import { Store } from '../classes/store';
import { Nullable } from '../types';

export type CommonCondition<R> =
    R extends Nullable<boolean | number | string> ? R : R extends object ? Nullable<R> : void;

interface IService {
    configure<T>(config: T): Promise<this> | this;
    create?<T, R>(create?: T): CommonCondition<R> | Promise<CommonCondition<R>>;
    deleteValue?<T, R>(d?: T): CommonCondition<R> | Promise<CommonCondition<R>>;
    getMultiValues?<T, R>(
        getMultiValues?: T,
    ):
        | CommonCondition<R extends R[] ? R[] : R extends null | undefined ? [] : R[]>
        | Promise<CommonCondition<R>>;
    getValues?<T, R>(get?: T): CommonCondition<R> | Promise<CommonCondition<R>>;
    itemExists?<T>(exists?: T): CommonCondition<boolean> | Promise<CommonCondition<boolean>>;
    modify?<T, R>(mod?: T): CommonCondition<R> | Promise<CommonCondition<R>>;
}

export abstract class Service implements IService {
    protected store: Store;

    protected constructor(public readonly ctx: Context) {
        this.store = ctx.store;
    }

    public abstract configure<T>(config: T): Promise<this> | this;

    public create?<T, R>(create?: T): CommonCondition<R> | Promise<CommonCondition<R>>;
    public deleteValue?<T, R>(d?: T): CommonCondition<R> | Promise<CommonCondition<R>>;
    public getMultiValues?<T, R>(
        getMultiValues?: T,
    ):
        | CommonCondition<R extends R[] ? R[] : R extends null | undefined ? [] : R[]>
        | Promise<CommonCondition<R>>;
    public getValues?<T, R>(get?: T): CommonCondition<R> | Promise<CommonCondition<R>>;
    public itemExists?<T>(exists?: T): CommonCondition<boolean> | Promise<CommonCondition<boolean>>;
    public modify?<T, R>(mod?: T): CommonCondition<R> | Promise<CommonCondition<R>>;
}
