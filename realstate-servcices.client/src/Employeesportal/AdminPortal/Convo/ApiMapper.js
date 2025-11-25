// ApiMapper.js
export class ApiMapper {
    static mapChat(chatData) {
        if (!chatData) return null;

        return {
            id: chatData.id,
            chatNo: chatData.chatNo,
            name: chatData.name,
            chatType: chatData.chatType,
            propertyId: chatData.propertyId,
            property: chatData.property ? this.mapProperty(chatData.property) : null,
            lastMessage: chatData.lastMessage,
            lastMessageAt: chatData.lastMessageAt ? new Date(chatData.lastMessageAt) : null,
            createdAt: new Date(chatData.createdAt),
            updatedAt: new Date(chatData.updatedAt),
            participants: chatData.participants?.map(p => this.mapChatParticipant(p)) || [],
            messages: chatData.messages?.map(m => this.mapMessage(m)) || []
        };
    }

    static mapProperty(propertyData) {
        if (!propertyData) return null;

        return {
            id: propertyData.id,
            propertyNo: propertyData.propertyNo,
            title: propertyData.title,
            description: propertyData.description,
            type: propertyData.type,
            price: propertyData.price,
            bedrooms: propertyData.bedrooms,
            bathrooms: propertyData.bathrooms,
            areaSqm: propertyData.areaSqm,
            address: propertyData.address,
            city: propertyData.city,
            state: propertyData.state,
            zipCode: propertyData.zipCode,
            status: propertyData.status,
            listedDate: propertyData.listedDate ? new Date(propertyData.listedDate) : null,
            country: propertyData.country,
            barangay: propertyData.barangay,
            ownerId: propertyData.ownerId,
            agentId: propertyData.agentId,
            createdAt: propertyData.createdAt ? new Date(propertyData.createdAt) : null,
            updatedAt: propertyData.updatedAt ? new Date(propertyData.updatedAt) : null,
            mainImage: propertyData.propertyImages?.[0]?.imageUrl ||
                propertyData.imageUrls?.[0] ||
                '/default-property.jpg',
            // Include full address for display
            fullAddress: propertyData.fullAddress ||
                `${propertyData.address || ''} ${propertyData.city || ''} ${propertyData.state || ''}`.trim()
        };
    }

    static mapChatParticipant(participantData) {
        if (!participantData) return null;

        return {
            id: participantData.id,
            chatId: participantData.chatId,
            baseMemberId: participantData.baseMemberId,
            recipientId: participantData.recipientId,
            role: participantData.role,
            participantType: participantData.participantType,
            unreadCount: participantData.unreadCount,
            lastReadAt: participantData.lastReadAt ? new Date(participantData.lastReadAt) : null,
            joinedAt: new Date(participantData.joinedAt),
            isActive: participantData.isActive,
            member: participantData.member ? this.mapBaseMember(participantData.member) : null,
            recipient: participantData.recipient ? this.mapBaseMember(participantData.recipient) : null
        };
    }

    static mapBaseMember(memberData) {
        if (!memberData) return null;

        return {
            id: memberData.id,
            firstName: memberData.firstName || memberData.username,
            lastName: memberData.lastName || '',
            fullName: memberData.fullName || memberData.username,
            profileImage: memberData.profileImage || memberData.profilePictureUrl,
            memberType: memberData.memberType || memberData.role,
            email: memberData.email,
            username: memberData.username
        };
    }

    static mapMessage(messageData) {
        if (!messageData) return null;

        return {
            id: messageData.id,
            messageNo: messageData.messageNo,
            chatId: messageData.chatId,
            senderId: messageData.senderId,
            recipientId: messageData.recipientId,
            content: messageData.content,
            messageType: messageData.messageType,
            isEdited: messageData.isEdited,
            isDeleted: messageData.isDeleted,
            sentAt: new Date(messageData.sentAt),
            readAt: messageData.readAt ? new Date(messageData.readAt) : null,
            editedAt: messageData.editedAt ? new Date(messageData.editedAt) : null,
            sender: this.mapBaseMember(messageData.sender),
            recipient: this.mapBaseMember(messageData.recipient),
            files: messageData.files?.map(f => this.mapMessageFile(f)) || [],
            reactions: messageData.reactions?.map(r => this.mapMessageReaction(r)) || []
        };
    }

    static mapMessageFile(fileData) {
        if (!fileData) return null;

        return {
            id: fileData.id,
            messageId: fileData.messageId,
            fileName: fileData.fileName,
            fileUrl: fileData.fileUrl,
            fileType: fileData.fileType,
            fileSize: fileData.fileSize,
            thumbnailUrl: fileData.thumbnailUrl,
            mimeType: fileData.mimeType,
            uploadedAt: new Date(fileData.uploadedAt)
        };
    }

    static mapMessageReaction(reactionData) {
        if (!reactionData) return null;

        return {
            id: reactionData.id,
            messageId: reactionData.messageId,
            baseMemberId: reactionData.baseMemberId,
            emoji: reactionData.emoji,
            reactedAt: new Date(reactionData.reactedAt),
            member: reactionData.member ? this.mapBaseMember(reactionData.member) : null
        };
    }

    static mapNotification(notificationData) {
        if (!notificationData) return null;

        return {
            id: notificationData.id,
            notificationNo: notificationData.notificationNo,
            baseMemberId: notificationData.baseMemberId,
            notificationType: notificationData.notificationType,
            title: notificationData.title,
            content: notificationData.content,
            data: notificationData.data,
            chatId: notificationData.chatId,
            messageId: notificationData.messageId,
            propertyId: notificationData.propertyId,
            isRead: notificationData.isRead,
            isPushed: notificationData.isPushed,
            createdAt: new Date(notificationData.createdAt),
            readAt: notificationData.readAt ? new Date(notificationData.readAt) : null,
            pushedAt: notificationData.pushedAt ? new Date(notificationData.pushedAt) : null,
            priority: notificationData.priority
        };
    }
}