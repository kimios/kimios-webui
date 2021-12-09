import {UpdateNoticeMessage} from 'app/kimios-client-api/model/updateNoticeMessage';

export class UpdateNoticeMessageImpl implements UpdateNoticeMessage {
  updateNoticeType?: UpdateNoticeMessage.UpdateNoticeTypeEnum;
  token?: string;
  sessionId?: string;
  message?: string;

  constructor(
    updateNoticeType,
    token,
    sessionId,
    message
  ) {
    this.updateNoticeType = updateNoticeType;
    this.token = token;
    this.sessionId = sessionId;
    this.message = message;
  }
}
