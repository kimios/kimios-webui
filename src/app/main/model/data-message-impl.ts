import {Serializable} from './serializable';
import {DataMessage} from 'app/kimios-client-api/model/dataMessage';
import {DMEntity} from 'app/kimios-client-api';

export class DataMessageImpl implements DataMessage {
  token?: string;
  sessionId?: string;
  dmEntityList?: Array<DMEntity>;
  parentUid?: number;

  constructor(token: string, sessionId: string, dmEntityList: Array<DMEntity>, parentUid: number) {
    this.token = token;
    this.sessionId = sessionId;
    this.dmEntityList = dmEntityList;
    this.parentUid = parentUid;
  }
}
