/** Flat node with expandable and level information */
export class DynamicFlatNode {
    constructor(public item: string, public uid: number, public level = 1, public expandable = false,
                public isLoading = false) {}
}
