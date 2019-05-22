export class Tag {

    private _name: string;
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

    set name(value: string) {
        this._name = value;
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
}
