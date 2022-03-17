export class Message {
  token: string;
  sessionId: string;

  constructor(token: string, sessionId: string) {
    this.token = token;
    this.sessionId = sessionId;
  }
}
