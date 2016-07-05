using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;
using System;
using System.Collections.Concurrent;
using System.Linq;
using System.Net.WebSockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace WebRTCCore.Middleware
{
    public class WebsocketMiddleware
    {
        private RequestDelegate next { get; }
        private static ConcurrentDictionary<string, WebSocket> AliveSockets { get; set; } = new ConcurrentDictionary<string, WebSocket>();

        public WebsocketMiddleware(RequestDelegate next)
        {
            this.next = next;
        }

        private async Task<Response> AcceptSocket(WebSocketManager manager)
        {
            if (AliveSockets.Count == 2)
                return null;

            var webSocket = await manager.AcceptWebSocketAsync();

            var response = new Response { Id = Guid.NewGuid().ToString() };

            AliveSockets.GetOrAdd(response.Id, webSocket);

            await webSocket.SendAsync(new ArraySegment<byte>(Encoding.UTF8.GetBytes(JsonConvert.SerializeObject(response))),
                  WebSocketMessageType.Text, true, CancellationToken.None);

            return response;
        }

        private void RemoveClosedSocket(string socketId, WebSocket socket)
        {
            if (socket.State == WebSocketState.Closed || socket.State == WebSocketState.CloseReceived)
                AliveSockets.TryRemove(socketId, out socket);
        }

        private async Task HandleOpenConnection(string socketId)
        {
            var webSocket = AliveSockets.FirstOrDefault(x => x.Key.Equals(socketId)).Value;

            while (webSocket.State == WebSocketState.Open)
            {
                try
                {
                    var buffer = new ArraySegment<byte>(new byte[4096]);

                    await webSocket.ReceiveAsync(buffer, CancellationToken.None);

                    var str = Encoding.UTF8.GetString(buffer.Array, 0, buffer.Count).Trim('\0');
                    if (str != string.Empty || str != "")
                    {
                        var msg = JsonConvert.DeserializeObject<Response>(str);

                        var sockit = AliveSockets.Where(x => !x.Key.Equals(msg.Id)).First();

                        await sockit.Value.SendAsync(new ArraySegment<byte>(Encoding.UTF8.GetBytes(str)),
                            WebSocketMessageType.Text, true, CancellationToken.None);
                    }
                }
                catch (Exception e)
                {
                    Console.WriteLine(e.Message);
                }
            }

            RemoveClosedSocket(socketId, webSocket);
        }

        public async Task Invoke(HttpContext context)
        {
            if (context.WebSockets.IsWebSocketRequest && AliveSockets.Count < 2)
                await HandleOpenConnection((await AcceptSocket(context.WebSockets)).Id);
            else
                await next(context);
        }
    }
}
