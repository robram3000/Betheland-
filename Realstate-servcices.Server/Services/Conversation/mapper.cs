using AutoMapper;
using Realstate_servcices.Server.Dto.Chat;
using Realstate_servcices.Server.Entity.Chat;

namespace Realstate_servcices.Server.Services.Conversation
{

    public class ChatMappingProfile : Profile
    {
        public ChatMappingProfile()
        {
            CreateMap<Chat, ChatDto>();
            CreateMap<CreateChatDto, Chat>();
            CreateMap<UpdateChatDto, Chat>();
            CreateMap<ChatParticipant, ChatParticipantDto>();
        }
    }

    public class MessageMappingProfile : Profile
    {
        public MessageMappingProfile()
        {
            CreateMap<Message, MessageDto>();
            CreateMap<CreateMessageDto, Message>();
            CreateMap<UpdateMessageDto, Message>();
            CreateMap<MessageFile, MessageFileDto>();
            CreateMap<MessageReaction, MessageReactionDto>();
        }
    }

    public class NotificationMappingProfile : Profile
    {
        public NotificationMappingProfile()
        {
            CreateMap<Notification, NotificationDto>();
            CreateMap<CreateNotificationDto, Notification>();
        }
    }
}
