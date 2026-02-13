using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace Realstate_servcices.Server.Controllers.convo
{
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class ChatHub : Hub
    {
        private static readonly Dictionary<string, string> _userConnections = new();
        private static readonly Dictionary<string, HashSet<string>> _chatGroups = new();

        public override async Task OnConnectedAsync()
        {
            var userId = GetUserId();
            var userName = GetUserName();

            if (!string.IsNullOrEmpty(userId))
            {
                _userConnections[Context.ConnectionId] = userId;

                await Clients.Caller.SendAsync("ConnectionStatus", new
                {
                    status = "connected",
                    connectionId = Context.ConnectionId,
                    userId = userId,
                    userName = userName
                });

                Console.WriteLine($"✅ User {userId} ({userName}) connected with connection {Context.ConnectionId}");

                // Notify others that user is online
                await Clients.All.SendAsync("UserOnlineStatus", new
                {
                    userId = userId,
                    userName = userName,
                    isOnline = true,
                    connectionId = Context.ConnectionId
                });
            }
            else
            {
                Console.WriteLine($"⚠️ User connected without valid authentication: {Context.ConnectionId}");
            }

            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userId = GetUserId();
            var userName = GetUserName();

            if (!string.IsNullOrEmpty(userId))
            {
                _userConnections.Remove(Context.ConnectionId);

                // Remove from all chat groups
                foreach (var group in _chatGroups.Where(g => g.Value.Contains(Context.ConnectionId)).ToList())
                {
                    _chatGroups[group.Key].Remove(Context.ConnectionId);
                    if (!_chatGroups[group.Key].Any())
                    {
                        _chatGroups.Remove(group.Key);
                    }
                }

                // Notify others that user went offline
                await Clients.All.SendAsync("UserOnlineStatus", new
                {
                    userId = userId,
                    userName = userName,
                    isOnline = false,
                    connectionId = Context.ConnectionId
                });

                Console.WriteLine($"🔌 User {userId} ({userName}) disconnected");
            }

            await base.OnDisconnectedAsync(exception);
        }

        public async Task JoinChat(string chatId)
        {
            var userId = GetUserId();
            var userName = GetUserName();

            if (string.IsNullOrEmpty(userId))
            {
                await Clients.Caller.SendAsync("Error", new { message = "Authentication required to join chat" });
                return;
            }

            Console.WriteLine($"🎯 User {userId} joining chat {chatId}");

            if (!_chatGroups.ContainsKey(chatId))
            {
                _chatGroups[chatId] = new HashSet<string>();
            }

            _chatGroups[chatId].Add(Context.ConnectionId);
            await Groups.AddToGroupAsync(Context.ConnectionId, chatId);

            await Clients.Group(chatId).SendAsync("UserJoined", new
            {
                chatId,
                userId = userId,
                userName = userName,
                connectionId = Context.ConnectionId,
                timestamp = DateTime.UtcNow
            });

            Console.WriteLine($"✅ User {userId} joined chat {chatId}");

            // Send confirmation to caller
            await Clients.Caller.SendAsync("ChatJoined", new
            {
                chatId = chatId,
                success = true
            });
        }

        public async Task LeaveChat(string chatId)
        {
            var userId = GetUserId();
            var userName = GetUserName();

            if (_chatGroups.ContainsKey(chatId))
            {
                _chatGroups[chatId].Remove(Context.ConnectionId);
                if (!_chatGroups[chatId].Any())
                {
                    _chatGroups.Remove(chatId);
                }
            }

            await Groups.RemoveFromGroupAsync(Context.ConnectionId, chatId);

            await Clients.Group(chatId).SendAsync("UserLeft", new
            {
                chatId,
                userId = userId,
                userName = userName,
                connectionId = Context.ConnectionId,
                timestamp = DateTime.UtcNow
            });

            Console.WriteLine($"🚪 User {userId} left chat {chatId}");
        }

        public async Task SendMessage(string chatId, string content, string messageType, object files)
        {
            var userId = GetUserId();
            var userName = GetUserName();

            if (string.IsNullOrEmpty(userId))
            {
                await Clients.Caller.SendAsync("Error", new { message = "Authentication required to send messages" });
                return;
            }

            Console.WriteLine($"📤 User {userId} sending message to chat {chatId}");

            var messageData = new
            {
                id = Guid.NewGuid().ToString(),
                chatId,
                senderId = userId,
                senderName = userName,
                content,
                messageType,
                files,
                sentAt = DateTime.UtcNow,
                isCurrentUser = true
            };

            await Clients.Group(chatId).SendAsync("NewMessage", messageData);
            Console.WriteLine($"✅ Message sent to chat {chatId} by user {userId}");
        }

        public async Task SendTypingIndicator(string chatId, bool isTyping)
        {
            var userId = GetUserId();
            var userName = GetUserName();

            await Clients.OthersInGroup(chatId).SendAsync("TypingIndicator", new
            {
                chatId,
                userId,
                userName,
                isTyping,
                timestamp = DateTime.UtcNow
            });
        }

        public async Task MarkMessageAsRead(string chatId, string messageId)
        {
            var userId = GetUserId();
            var userName = GetUserName();

            await Clients.Group(chatId).SendAsync("MessageRead", new
            {
                chatId,
                messageId,
                userId,
                userName,
                readAt = DateTime.UtcNow
            });
        }

        // Ping method to keep connection alive
        public async Task Ping()
        {
            await Clients.Caller.SendAsync("Pong", new
            {
                timestamp = DateTime.UtcNow,
                serverTime = DateTime.UtcNow.ToString("O")
            });
        }

        // Get connection info
        public async Task GetConnectionInfo()
        {
            var userId = GetUserId();
            var userName = GetUserName();

            await Clients.Caller.SendAsync("ConnectionInfo", new
            {
                connectionId = Context.ConnectionId,
                userId = userId,
                userName = userName,
                connectedAt = DateTime.UtcNow,
                isAuthenticated = !string.IsNullOrEmpty(userId)
            });
        }

        private string GetUserId()
        {
            return Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        }

        private string GetUserName()
        {
            return Context.User?.FindFirst(ClaimTypes.Name)?.Value ?? "Unknown User";
        }
    }
}