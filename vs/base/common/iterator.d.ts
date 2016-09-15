export interface IIterator<T> {
    next(): T;
}
export declare class ArrayIterator<T> implements IIterator<T> {
    private items;
    private start;
    private end;
    private index;
    constructor(items: T[], start?: number, end?: number);
    next(): T;
}
export declare class MappedIterator<T, R> implements IIterator<R> {
    protected iterator: IIterator<T>;
    protected fn: (item: T) => R;
    constructor(iterator: IIterator<T>, fn: (item: T) => R);
    next(): R;
}
export interface INavigator<T> extends IIterator<T> {
    current(): T;
    previous(): T;
    parent(): T;
    first(): T;
    last(): T;
}
export declare class MappedNavigator<T, R> extends MappedIterator<T, R> implements INavigator<R> {
    protected navigator: INavigator<T>;
    constructor(navigator: INavigator<T>, fn: (item: T) => R);
    current(): R;
    previous(): R;
    parent(): R;
    first(): R;
    last(): R;
}
