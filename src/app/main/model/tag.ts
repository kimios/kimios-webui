export class Tag {

    private readonly _name: string;
    private _count: number;
    private readonly _uid: number;

    constructor(name: string, uid: number) {
        this._name = name;
        this._count = -1;
        this._uid = uid;
    }

    get name(): string {
        return this._name;
    }

    get count(): number {
        return this._count;
    }

    set count(value: number) {
        this._count = value;
    }

    get uid(): number {
        return this._uid;
    }

    public static makeFacetFieldName(tag: Tag): string {
        return '';
    }
}
