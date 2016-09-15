export declare class ArraySet<T> {
    private _elements;
    constructor(elements?: T[]);
    set(element: T): void;
    contains(element: T): boolean;
    unset(element: T): void;
    elements: T[];
}
