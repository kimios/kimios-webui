import {DMEntity} from 'app/kimios-client-api';

export class TreeNodeMoveUpdate {
    entityMoved: DMEntity;
    entityTarget: DMEntity;
    initialParentUid: number;

    constructor(entityMoved: DMEntity, entityTarget: DMEntity, initialParentUid: number) {
        this.entityMoved = entityMoved;
        this.entityTarget = entityTarget;
        this.initialParentUid = initialParentUid;
    }
}
