export class WsClient {
  private socket: WebSocket | null = null;

  connect(url: string) {
    if (this.socket) {
      return;
    }

    this.socket = new WebSocket(url);
  }

  disconnect() {
    this.socket?.close();
    this.socket = null;
  }

  send(data: string) {
    this.socket?.send(data);
  }
}
