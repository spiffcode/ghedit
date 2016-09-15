import 'vs/css!./media/notabstitle';
import { IEditorGroup } from 'vs/workbench/common/editor';
import { TitleControl } from 'vs/workbench/browser/parts/editor/titleControl';
export declare class NoTabsTitleControl extends TitleControl {
    private titleContainer;
    private titleLabel;
    private titleDecoration;
    private titleDescription;
    setContext(group: IEditorGroup): void;
    create(parent: HTMLElement): void;
    private onTitleLabelClick(e);
    private onTitleDoubleClick(e);
    private onTitleClick(e);
    protected doRefresh(): void;
}
