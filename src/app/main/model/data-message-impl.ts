import {DataMessage} from 'app/kimios-client-api/model/dataMessage';
import {DMEntity, Folder, Workspace, Document as KimiosDocument} from 'app/kimios-client-api';
import {DMEntityWrapper} from '../../kimios-client-api/model/dMEntityWrapper';

export class DataMessageImpl implements DataMessage {
  token?: string;
  sessionId?: string;
  dmEntityList?: Array<DMEntityWrapper>;
  parent?: DMEntityWrapper;

  constructor(token: string, sessionId: string, dmEntityList: Array<DMEntityWrapper>, parent: DMEntityWrapper) {
    this.token = token;
    this.sessionId = sessionId;
    this.dmEntityList = dmEntityList;
    this.parent = parent;
  }
}
