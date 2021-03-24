import {Meta} from 'app/kimios-client-api';
import {MetaDataTypeMapping} from 'app/main/model/meta-data-type.enum';

export class MetaUtils {
    public static compareMetas(a: Meta, b: Meta, field: string): number {
        if (field === 'metaType') {
            return MetaDataTypeMapping[a.metaType].localeCompare(MetaDataTypeMapping[b.metaType]);
        } else {
            return a.name.localeCompare(b.name);
        }
    }
}
