import {DataMessage} from 'app/kimios-client-api/model/dataMessage';
import {DMEntity} from 'app/kimios-client-api';

export class DataMessageImpl implements DataMessage {
  token?: string;
  sessionId?: string;
  dmEntityList?: Array<DMEntity>;
  parent?: DMEntity;

  constructor(token: string, sessionId: string, dmEntityList: Array<DMEntity>, parent: DMEntity) {
    this.token = token;
    this.sessionId = sessionId;
    this.dmEntityList = dmEntityList;
    this.parent = parent;
  }
}
