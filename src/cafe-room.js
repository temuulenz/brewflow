export class CafeRoom {
  constructor(state) { this.state = state; }
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === '/connect' && request.headers.get('Upgrade') === 'websocket') {
      const pair = new WebSocketPair();
      this.state.acceptWebSocket(pair[1]);
      pair[1].send(JSON.stringify({type:'connected'}));
      return new Response(null,{status:101,webSocket:pair[0]});
    }
    if (url.pathname === '/notify' && request.method === 'POST') {
      const message = JSON.stringify({type:'orders-changed'});
      for (const socket of this.state.getWebSockets()) { try { socket.send(message); } catch {} }
      return Response.json({ok:true});
    }
    return new Response('Not found',{status:404});
  }
  webSocketMessage() {}
  webSocketClose() {}
  webSocketError() {}
}
