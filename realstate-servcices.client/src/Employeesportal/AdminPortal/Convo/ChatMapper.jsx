// ChatMapper.jsx - FIXED VERSION
import moment from 'moment';

export const chatMapper = {
    toCreateRequest: (formData) => {
        try {
            console.log('Raw formData for chat creation:', formData);

            const createRequest = {
                name: formData.name || '',
                chatType: formData.chatType || 'direct',
                propertyId: formData.propertyId ? parseInt(formData.propertyId) : null,
                participantIds: formData.participantIds || []
            };

            console.log('Mapped chat create request:', createRequest);
            return createRequest;
        } catch (error) {
            console.error('Error in toCreateRequest:', error, formData);
            throw new Error('Failed to map chat data for creation');
        }
    },

    toUpdateRequest: (formData) => {
        try {
            console.log('Raw formData for chat update:', formData);

            const updateRequest = {
                name: formData.name !== undefined ? formData.name : undefined,
                chatType: formData.chatType !== undefined ? formData.chatType : undefined,
                propertyId: formData.propertyId !== undefined ?
                    (formData.propertyId ? parseInt(formData.propertyId) : null) : undefined
            };

            // Remove undefined values
            Object.keys(updateRequest).forEach(key =>
                updateRequest[key] === undefined && delete updateRequest[key]
            );

            console.log('Mapped chat update request:', updateRequest);
            return updateRequest;
        } catch (error) {
            console.error('Error in toUpdateRequest:', error, formData);
            throw new Error('Failed to map chat data for update');
        }
    },

    toAddParticipantRequest: (formData) => {
        try {
            console.log('Raw formData for adding participant:', formData);

            const addParticipantRequest = {
                baseMemberId: parseInt(formData.baseMemberId) || 0,
                recipientId: formData.recipientId ? parseInt(formData.recipientId) : null,
                role: formData.role || 'member',
                participantType: formData.participantType || 'user'
            };

            console.log('Mapped add participant request:', addParticipantRequest);
            return addParticipantRequest;
        } catch (error) {
            console.error('Error in toAddParticipantRequest:', error, formData);
            throw new Error('Failed to map participant data for addition');
        }
    },

    toCreateMessageRequest: (formData) => {
        try {
            console.log('Raw formData for message creation:', formData);

            const createMessageRequest = {
                chatId: parseInt(formData.chatId) || 0,
                content: formData.content || '',
                messageType: formData.messageType || 'text',
                recipientId: formData.recipientId ? parseInt(formData.recipientId) : null,
                files: formData.files || []
            };

            console.log('Mapped message create request:', createMessageRequest);
            return createMessageRequest;
        } catch (error) {
            console.error('Error in toCreateMessageRequest:', error, formData);
            throw new Error('Failed to map message data for creation');
        }
    },

    toUpdateMessageRequest: (formData) => {
        try {
            console.log('Raw formData for message update:', formData);

            const updateMessageRequest = {
                content: formData.content || ''
            };

            console.log('Mapped message update request:', updateMessageRequest);
            return updateMessageRequest;
        } catch (error) {
            console.error('Error in toUpdateMessageRequest:', error, formData);
            throw new Error('Failed to map message data for update');
        }
    },

    toFrontend: (backendData) => {
        try {
            if (!backendData) {
                console.warn('No backend data provided to toFrontend');
                return null;
            }

            console.log('Raw backend chat data:', backendData);

            const chat = {
                id: backendData.id || 0,
                chatNo: backendData.chatNo || '',
                name: backendData.name || '',
                chatType: backendData.chatType || 'direct',
                propertyId: backendData.propertyId || null,
                lastMessage: backendData.lastMessage || '',
                lastMessageAt: backendData.lastMessageAt ? moment(backendData.lastMessageAt) : null,
                createdAt: backendData.createdAt ? moment(backendData.createdAt) : null,
                updatedAt: backendData.updatedAt ? moment(backendData.updatedAt) : null,
                unreadCount: backendData.unreadCount || 0,
                property: null,
                participants: [],
                messages: []
            };

            // Map property data if available
            if (backendData.property) {
                chat.property = {
                    id: backendData.property.id,
                    propertyNo: backendData.property.propertyNo || '',
                    title: backendData.property.title || '',
                    description: backendData.property.description || '',
                    type: backendData.property.type || '',
                    price: backendData.property.price || 0,
                    bedrooms: backendData.property.bedrooms || 0,
                    bathrooms: backendData.property.bathrooms || 0,
                    areaSqm: backendData.property.areaSqm || 0,
                    address: backendData.property.address || '',
                    city: backendData.property.city || '',
                    state: backendData.property.state || '',
                    zipCode: backendData.property.zipCode || '',
                    status: backendData.property.status || '',
                    listedDate: backendData.property.listedDate ? moment(backendData.property.listedDate) : null,
                    country: backendData.property.country || '',
                    barangay: backendData.property.barangay || '',
                    ownerId: backendData.property.ownerId || 0,
                    agentId: backendData.property.agentId || 0
                };
            }

            // Map participants if available
            if (backendData.participants && Array.isArray(backendData.participants)) {
                chat.participants = backendData.participants.map(participant => ({
                    id: participant.id || 0,
                    chatId: participant.chatId || 0,
                    baseMemberId: participant.baseMemberId || 0,
                    recipientId: participant.recipientId || null,
                    role: participant.role || 'member',
                    participantType: participant.participantType || 'user',
                    unreadCount: participant.unreadCount || 0,
                    lastReadAt: participant.lastReadAt ? moment(participant.lastReadAt) : null,
                    joinedAt: participant.joinedAt ? moment(participant.joinedAt) : null,
                    isActive: participant.isActive !== undefined ? participant.isActive : true,
                    member: participant.member ? {
                        id: participant.member.id,
                        firstName: participant.member.firstName || '',
                        lastName: participant.member.lastName || '',
                        fullName: participant.member.fullName || '',
                        profileImage: participant.member.profileImage || '',
                        memberType: participant.member.memberType || 'User',
                        email: participant.member.email || '',
                        username: participant.member.username || ''
                    } : null,
                    recipient: participant.recipient ? {
                        id: participant.recipient.id,
                        firstName: participant.recipient.firstName || '',
                        lastName: participant.recipient.lastName || '',
                        fullName: participant.recipient.fullName || '',
                        profileImage: participant.recipient.profileImage || '',
                        memberType: participant.recipient.memberType || 'User',
                        email: participant.recipient.email || '',
                        username: participant.recipient.username || ''
                    } : null
                }));
            }

            // Map messages if available
            if (backendData.messages && Array.isArray(backendData.messages)) {
                chat.messages = backendData.messages.map(message => ({
                    id: message.id || 0,
                    messageNo: message.messageNo || '',
                    chatId: message.chatId || 0,
                    senderId: message.senderId || 0,
                    recipientId: message.recipientId || null,
                    content: message.content || '',
                    messageType: message.messageType || 'text',
                    isEdited: message.isEdited || false,
                    isDeleted: message.isDeleted || false,
                    sentAt: message.sentAt ? moment(message.sentAt) : null,
                    readAt: message.readAt ? moment(message.readAt) : null,
                    editedAt: message.editedAt ? moment(message.editedAt) : null,
                    sender: message.sender ? {
                        id: message.sender.id,
                        firstName: message.sender.firstName || '',
                        lastName: message.sender.lastName || '',
                        fullName: message.sender.fullName || '',
                        profileImage: message.sender.profileImage || '',
                        memberType: message.sender.memberType || 'User',
                        email: message.sender.email || '',
                        username: message.sender.username || ''
                    } : null,
                    recipient: message.recipient ? {
                        id: message.recipient.id,
                        firstName: message.recipient.firstName || '',
                        lastName: message.recipient.lastName || '',
                        fullName: message.recipient.fullName || '',
                        profileImage: message.recipient.profileImage || '',
                        memberType: message.recipient.memberType || 'User',
                        email: message.recipient.email || '',
                        username: message.recipient.username || ''
                    } : null,
                    files: message.files || [],
                    reactions: message.reactions || []
                }));
            }

            console.log('Mapped frontend chat:', chat);
            return chat;
        } catch (error) {
            console.error('Error in toFrontend:', error, backendData);
            throw new Error('Failed to map backend chat data to frontend format');
        }
    },

    toFrontendList: (backendList) => {
        try {
            // Handle both direct array and response object
            let dataArray = backendList;
            if (backendList && backendList.success !== undefined && backendList.data) {
                dataArray = backendList.data;
            }

            if (!Array.isArray(dataArray)) {
                console.warn('Backend chat list is not an array:', dataArray);
                return [];
            }

            return dataArray
                .map(chat => {
                    try {
                        return chatMapper.toFrontend(chat);
                    } catch (error) {
                        console.error('Error mapping chat in list:', error, chat);
                        return null;
                    }
                })
                .filter(chat => chat !== null);
        } catch (error) {
            console.error('Error in toFrontendList:', error);
            return [];
        }
    },

    toMessageFrontend: (backendData) => {
        try {
            if (!backendData) {
                console.warn('No backend data provided to toMessageFrontend');
                return null;
            }

            console.log('Raw backend message data:', backendData);

            const message = {
                id: backendData.id || 0,
                messageNo: backendData.messageNo || '',
                chatId: backendData.chatId || 0,
                senderId: backendData.senderId || 0,
                recipientId: backendData.recipientId || null,
                content: backendData.content || '',
                messageType: backendData.messageType || 'text',
                isEdited: backendData.isEdited || false,
                isDeleted: backendData.isDeleted || false,
                sentAt: backendData.sentAt ? moment(backendData.sentAt) : null,
                readAt: backendData.readAt ? moment(backendData.readAt) : null,
                editedAt: backendData.editedAt ? moment(backendData.editedAt) : null,
                sender: null,
                recipient: null,
                files: [],
                reactions: []
            };

            // Map sender if available
            if (backendData.sender) {
                message.sender = {
                    id: backendData.sender.id,
                    firstName: backendData.sender.firstName || '',
                    lastName: backendData.sender.lastName || '',
                    fullName: backendData.sender.fullName || '',
                    profileImage: backendData.sender.profileImage || '',
                    memberType: backendData.sender.memberType || 'User',
                    email: backendData.sender.email || '',
                    username: backendData.sender.username || ''
                };
            }

            // Map recipient if available
            if (backendData.recipient) {
                message.recipient = {
                    id: backendData.recipient.id,
                    firstName: backendData.recipient.firstName || '',
                    lastName: backendData.recipient.lastName || '',
                    fullName: backendData.recipient.fullName || '',
                    profileImage: backendData.recipient.profileImage || '',
                    memberType: backendData.recipient.memberType || 'User',
                    email: backendData.recipient.email || '',
                    username: backendData.recipient.username || ''
                };
            }

            // Map files if available
            if (backendData.files && Array.isArray(backendData.files)) {
                message.files = backendData.files.map(file => ({
                    id: file.id || 0,
                    messageId: file.messageId || 0,
                    fileName: file.fileName || '',
                    fileUrl: file.fileUrl || '',
                    fileType: file.fileType || '',
                    fileSize: file.fileSize || 0,
                    thumbnailUrl: file.thumbnailUrl || '',
                    mimeType: file.mimeType || '',
                    uploadedAt: file.uploadedAt ? moment(file.uploadedAt) : null
                }));
            }

            // Map reactions if available
            if (backendData.reactions && Array.isArray(backendData.reactions)) {
                message.reactions = backendData.reactions.map(reaction => ({
                    id: reaction.id || 0,
                    messageId: reaction.messageId || 0,
                    baseMemberId: reaction.baseMemberId || 0,
                    emoji: reaction.emoji || '',
                    reactedAt: reaction.reactedAt ? moment(reaction.reactedAt) : null,
                    member: reaction.member ? {
                        id: reaction.member.id,
                        firstName: reaction.member.firstName || '',
                        lastName: reaction.member.lastName || '',
                        fullName: reaction.member.fullName || '',
                        profileImage: reaction.member.profileImage || '',
                        memberType: reaction.member.memberType || 'User',
                        email: reaction.member.email || '',
                        username: reaction.member.username || ''
                    } : null
                }));
            }

            console.log('Mapped frontend message:', message);
            return message;
        } catch (error) {
            console.error('Error in toMessageFrontend:', error, backendData);
            throw new Error('Failed to map backend message data to frontend format');
        }
    },

    toMessageFrontendList: (backendList) => {
        try {
            // Handle both direct array and response object
            let dataArray = backendList;
            if (backendList && backendList.success !== undefined && backendList.data) {
                dataArray = backendList.data;
            }

            if (!Array.isArray(dataArray)) {
                console.warn('Backend message list is not an array:', dataArray);
                return [];
            }

            return dataArray
                .map(message => {
                    try {
                        return chatMapper.toMessageFrontend(message);
                    } catch (error) {
                        console.error('Error mapping message in list:', error, message);
                        return null;
                    }
                })
                .filter(message => message !== null);
        } catch (error) {
            console.error('Error in toMessageFrontendList:', error);
            return [];
        }
    }
};

export default chatMapper;