import {UpdateNoticeMessage} from 'app/kimios-client-api/model/updateNoticeMessage';

export class UpdateNoticeMessageImpl implements UpdateNoticeMessage {
  updateNoticeType?: UpdateNoticeMessage.UpdateNoticeTypeEnum;
  token?: string;
  message?: string;
  sessionId?: string;

  constructor(
    updateNoticeType,
    token,
    message,
    sessionId
  ) {
    this.updateNoticeType = updateNoticeType;
    token = token;
    message = message;
    sessionId = sessionId;
  }
}
