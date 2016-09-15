import { IMode, IModeTransition } from 'vs/editor/common/modes';
export declare class ModeTransition {
    _modeTransitionBrand: void;
    startIndex: number;
    mode: IMode;
    modeId: string;
    constructor(startIndex: number, mode: IMode);
    static findIndexInSegmentsArray(arr: ModeTransition[], desiredIndex: number): number;
    static create(modeTransitions: IModeTransition[]): ModeTransition[];
}
