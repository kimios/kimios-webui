import {DMEntity} from 'app/kimios-client-api';

export enum DMEntityType {
    WORKSPACE = 1,
    FOLDER = 2,
    DOCUMENT = 3
}

export class DMEntityUtils {

    public static dmEntityIsWorkspace(dmEntity: DMEntity): boolean {
        return dmEntity.type === DMEntityType.WORKSPACE;
    }

    public static dmEntityIsFolder(dmEntity: DMEntity): boolean {
        return dmEntity.type === DMEntityType.FOLDER;
    }

    public static dmEntityIsDocument(dmEntity: DMEntity): boolean {
        return dmEntity.type === DMEntityType.DOCUMENT;
    }
}
