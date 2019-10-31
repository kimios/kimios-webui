import {DynamicFlatNode} from './dynamic-flat-node';

export class DynamicFlatNodeWithUid extends DynamicFlatNode {
    public uid: number;

    constructor(public item: string, public level = 1, public expandable = false,
                public isLoading = false, uid: number) {
        super(item, level, expandable, isLoading);
        this.uid = uid;
    }
}
