using AutoMapper;
using Realstate_servcices.Server.Dto.Chat;
using Realstate_servcices.Server.Entity.Chat;
using Realstate_servcices.Server.Repository.Conversation;
using Realstate_servcices.Server.Utilities.Storage;
namespace Realstate_servcices.Server.Services.Conversation
{
    public class MessageService : IMessageService
    {
        private readonly IMessageRepository _messageRepository;
        private readonly IChatRepository _chatRepository;
        private readonly IChatParticipantRepository _participantRepository;
        private readonly IFileStorageService _fileStorageService;
        private readonly IMapper _mapper;

        public MessageService(IMessageRepository messageRepository, IChatRepository chatRepository,
            IChatParticipantRepository participantRepository, IFileStorageService fileStorageService, IMapper mapper)
        {
            _messageRepository = messageRepository;
            _chatRepository = chatRepository;
            _participantRepository = participantRepository;
            _fileStorageService = fileStorageService;
            _mapper = mapper;
        }

        public async Task<MessageDto> SendMessageAsync(CreateMessageDto createDto, int senderId)
        {
            if (!await _chatRepository.UserHasAccessToChatAsync(senderId, createDto.ChatId))
                throw new UnauthorizedAccessException("No access to this chat");

            var message = new Message
            {
                ChatId = createDto.ChatId,
                SenderId = senderId,
                Content = createDto.Content,
                MessageType = createDto.MessageType
            };
            if (createDto.Files != null && createDto.Files.Any())
            {
                foreach (var fileDto in createDto.Files)
                {
                    var messageFile = new MessageFile
                    {
                        FileName = fileDto.FileName,
                        FileUrl = fileDto.FileUrl,
                        FileType = fileDto.FileType,
                        FileSize = fileDto.FileSize,
                        ThumbnailUrl = fileDto.ThumbnailUrl,
                        MimeType = fileDto.MimeType
                    };
                    message.MessageFiles.Add(messageFile);
                }
            }

            var createdMessage = await _messageRepository.CreateAsync(message);
            return _mapper.Map<MessageDto>(createdMessage);
        }

        public async Task<List<MessageDto>> GetChatMessagesAsync(int chatId, int userId, int page = 1, int pageSize = 50)
        {
            if (!await _chatRepository.UserHasAccessToChatAsync(userId, chatId))
                throw new UnauthorizedAccessException("No access to this chat");

            var messages = await _messageRepository.GetChatMessagesAsync(chatId, page, pageSize);
            await _participantRepository.UpdateLastReadAsync(chatId, userId);

            return _mapper.Map<List<MessageDto>>(messages);
        }

        public async Task<MessageDto> UpdateMessageAsync(int messageId, UpdateMessageDto updateDto, int userId)
        {
            var message = await _messageRepository.GetByIdAsync(messageId);
        

            if (message.SenderId != userId)
                throw new UnauthorizedAccessException("Can only edit your own messages");

            message.Content = updateDto.Content;
            message.IsEdited = true;
            message.EditedAt = DateTime.UtcNow;

            var updatedMessage = await _messageRepository.UpdateAsync(message);
            return _mapper.Map<MessageDto>(updatedMessage);
        }

        public async Task<bool> DeleteMessageAsync(int messageId, int userId)
        {
            var message = await _messageRepository.GetByIdAsync(messageId);
     

            if (message.SenderId != userId)
                throw new UnauthorizedAccessException("Can only delete your own messages");

            return await _messageRepository.DeleteAsync(messageId);
        }

        public async Task<MessageDto> AddReactionAsync(int messageId, string emoji, int userId)
        {
            var message = await _messageRepository.GetByIdAsync(messageId);
    

            var existingReaction = message.Reactions.FirstOrDefault(r => r.BaseMemberId == userId && r.Emoji == emoji);
            if (existingReaction != null)
                return _mapper.Map<MessageDto>(message);

            var reaction = new MessageReaction
            {
                MessageId = messageId,
                BaseMemberId = userId,
                Emoji = emoji
            };

            message.Reactions.Add(reaction);
            await _messageRepository.UpdateAsync(message);

            return _mapper.Map<MessageDto>(message);
        }

        public async Task<bool> RemoveReactionAsync(int messageId, int userId)
        {
            var message = await _messageRepository.GetByIdAsync(messageId);
       

            var reaction = message.Reactions.FirstOrDefault(r => r.BaseMemberId == userId);
            if (reaction == null)
                return false;

            message.Reactions.Remove(reaction);
            await _messageRepository.UpdateAsync(message);
            return true;
        }
    }

}
