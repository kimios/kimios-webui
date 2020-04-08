import {DMEntity} from 'app/kimios-client-api';

export class TreeNodeMoveUpdate {
    entityMoved: DMEntity;
    entityTarget: DMEntity;

    constructor(entityMoved: DMEntity, entityTarget: DMEntity) {
        this.entityMoved = entityMoved;
        this.entityTarget = entityTarget;
    }
}
