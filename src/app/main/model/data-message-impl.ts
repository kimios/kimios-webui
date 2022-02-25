import {DataMessage} from 'app/kimios-client-api/model/dataMessage';
import {DMEntity, Folder, Workspace, Document as KimiosDocument} from 'app/kimios-client-api';

export class DataMessageImpl implements DataMessage {
  token?: string;
  sessionId?: string;
  dmEntityList?: Array<Workspace | Folder | KimiosDocument>;
  parent?: DMEntity;

  constructor(token: string, sessionId: string, dmEntityList: Array<Workspace | Folder | KimiosDocument>, parent: DMEntity) {
    this.token = token;
    this.sessionId = sessionId;
    this.dmEntityList = dmEntityList;
    this.parent = parent;
  }
}
