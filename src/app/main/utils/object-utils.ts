export class ObjectUtils {
    public static extractValueRec(o: Object, propPath: Array<string>): any {
        const propName = propPath.shift();
        if (o[propName] == null || o[propName] === undefined) {
            return null;
        } else {
            if (propPath.length === 0) {
                return o[propName];
            } else {
                return this.extractValueRec(o[propName], propPath);
            }
        }
    }
}
