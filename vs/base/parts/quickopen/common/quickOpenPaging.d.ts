import { PagedModel } from 'vs/base/common/paging';
import { IModel, IDataSource, IRenderer, IRunner } from 'vs/base/parts/quickopen/common/quickOpen';
export interface IStub {
    index: number;
}
export interface IPagedRenderer<T> extends IRenderer<T> {
    renderPlaceholder(index: number, templateId: string, data: any): void;
}
export declare class QuickOpenPagedModel<T> implements IModel<any> {
    dataSource: IDataSource<IStub>;
    renderer: IRenderer<IStub>;
    runner: IRunner<IStub>;
    entries: IStub[];
    constructor(model: PagedModel<T>, dataSource: IDataSource<T>, renderer: IPagedRenderer<T>, runner: IRunner<T>);
}
