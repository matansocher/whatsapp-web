import firebase from 'firebase';
import { database } from './config';

function upsertUserData(userData) {
    const { uid } = userData;
    return database.collection('users').doc(uid).set(userData, { merge: true });
}

function getUserDetails(userId) {
    return database.collection('users').where('uid', '==', userId);
}

function updateLastSeen(userId) {
    return database.collection('users').doc(userId).set({ lastSeen: firebase.firestore.FieldValue.serverTimestamp() }, { merge: true });
}

function searchUsers(searchInput) {
    return database.collection('users').where('email', '>=', searchInput).where('email', '<=', searchInput + `z`).get();
}

function fetchChatId(userId) {
    return database.collection('chats').where('participants', 'array-contains', userId).get();
}

function getConversations(userId) {
    return database.collection('chats').where('participants', 'array-contains', userId).orderBy('lastMessageTime', 'desc');
}

function getChatsUsers(usersUids) {
    return database.collection('users').where('uid', 'in', usersUids).get();
}

function setupChat(chatId, participants) {
    const batch = database.batch();
    participants.forEach(participant => {
        batch.set(database.collection('chats').doc(chatId).collection('unreadMessagesCount').doc(participant), { count: 0 });
    });
    batch.set(database.collection('chats').doc(chatId), { lastMessageTime: null, participants, pinnedFor: [], typing: [] });
    return batch.commit();
}

async function makeSureThreadIsSetup(chatId, messageIdForThread, participants) {
    const currentThreadMessages = await database.collection('chats').doc(chatId).collection('messages').doc(messageIdForThread).collection('threadMessages').get();
    if (!currentThreadMessages.empty) {
        return;
    }
    const batch = database.batch();
    participants.forEach(participant => {
        batch.set(database.collection('chats').doc(chatId).collection('messages').doc(messageIdForThread).collection('unreadMessagesCount').doc(participant), { count: 0 });
    });
    return batch.commit();
}

async function deleteChat(chatId) {
    return database.collection('chats').doc(chatId).delete();
}

function getMessages(chatId) {
    return database.collection('chats').doc(chatId).collection('messages').orderBy('time').limit(50);
}

function getThreadMessages(chatId, messageId) {
    return database.collection('chats').doc(chatId).collection('messages').doc(messageId).collection('threadMessages').orderBy('time').limit(50);
}

function sendMessage(userId, message, participants) {
    participants.filter(participant => participant !== userId).forEach(participant => {
        return database.collection('chats').doc(message.chatId).collection('unreadMessagesCount').doc(participant).update({ count: firebase.firestore.FieldValue.increment(1) });
    });
    database.collection('chats').doc(message.chatId).collection('messages').doc().set(message); // add the message to the relevant collection
    return database.collection('chats').doc(message.chatId).update({lastMessageTime: message.time}); // set chat's last message time and chat's participants
}

function sendThreadMessage(userId, message, participants) {
    participants.filter(participant => participant !== userId).forEach(participant => {
        return database.collection('chats').doc(message.chatId).collection('messages').doc(message.messageIdForThread).collection('unreadMessagesCount').doc(participant).update({ count: firebase.firestore.FieldValue.increment(1) });
    });
    database.collection('chats').doc(message.chatId).collection('messages').doc(message.messageIdForThread).collection('threadMessages').doc().set(message); // add the message to the relevant collection
    return database.collection('chats').doc(message.chatId).update({lastMessageTime: message.time}); // set chat's last message time and chat's participants
}

function editMessage(chatId, messageId, newText) {
    return database.collection('chats').doc(chatId).collection('messages').doc(messageId).set({ text: newText, edited: true, time: firebase.firestore.FieldValue.serverTimestamp() }, { merge: true });
}

function editThreadMessage(chatId, messageId, threadMessageId, newText) {
    return database.collection('chats').doc(chatId).collection('messages').doc(messageId).collection('threadMessages').doc(threadMessageId).set({ text: newText, edited: true }, { merge: true });
}

async function deleteMessage(userId, chatId, messageId) {
    await Promise.all([
        deleteCollection(`/chats/${chatId}/messages/${messageId}/threadMessages`, 50),
        deleteCollection(`/chats/${chatId}/messages/${messageId}/unreadMessagesCount`, 50) 
    ]);
    removeStarredMessage(userId, { messageId });
    return database.collection('chats').doc(chatId).collection('messages').doc(messageId).delete();
}

function deleteThreadMessage(userId, chatId, messageId, threadMessageId) {
    removeStarredMessage(userId, { threadMessageId });
    return database.collection('chats').doc(chatId).collection('messages').doc(messageId).collection('threadMessages').doc(threadMessageId).delete();
}

function markMessagesReadInConversation(userId, chatId) {
    return database.collection('chats').doc(chatId).collection('unreadMessagesCount').doc(userId).set({ count: 0 });
}

function markMessagesReadInThread(userId, chatId, messageId) {
    return database.collection('chats').doc(chatId).collection('messages').doc(messageId).collection('unreadMessagesCount').doc(userId).set({ count: 0 });
}

function markChatUnread(userId, chatId) {
    return database.collection('chats').doc(chatId).collection('unreadMessagesCount').doc(userId).set({ count: ' ' });
}

function getMessagesUnreadInConversationCount(chatId) {
    return database.collection('chats').doc(chatId).collection('unreadMessagesCount');
}

function getMessagesUnreadInThreadCount(chatId, messageId) {
    return database.collection('chats').doc(chatId).collection('messages').doc(messageId).collection('unreadMessagesCount');
}

async function deleteCollection(collectionPath, batchSize) {
    const collectionRef = database.collection(collectionPath);
    const query = collectionRef.orderBy('__name__').limit(batchSize);
  
    return new Promise((resolve, reject) => {
        deleteQueryBatch(query, resolve).catch(reject);
    });
  }
  
async function deleteQueryBatch(query, resolve) {
    const snapshot = await query.get();

    const batchSize = snapshot.size;
    if (batchSize === 0) { // When there are no documents left, we are done
        resolve();
        return;
    }

    const batch = database.batch(); // Delete documents in a batch
    snapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();

    process.nextTick(() => deleteQueryBatch(query, resolve)); // Recurse on the next process tick, to avoid exploding the stack.
}

async function getStarredMessages(userId) {
    // return database.collection('chats').doc('ynkXY4UhCfIJ4GDop7Du').collection('messages').doc('1LiIxRUsjRMhtM9824JM').get();
    const starredMessagesDataRes = await database.collection('users').doc(userId).collection('userStarredMessages').get();

    let starredMessagesData = starredMessagesDataRes.docs.map(doc => doc.data()).map(doc => {
        const { chatId, messageId, threadMessageId } = doc;
        return { chatId, messageId, threadMessageId };
    }).slice(0, 10);

    const promisesArr = [];
    starredMessagesData.forEach(({ chatId, messageId, threadMessageId }) => {
        promisesArr.push(getMessage(chatId, messageId, threadMessageId));
    });

    const notExistingMessagesPromises = [];
    const starredMessagesArr = await Promise.all(promisesArr);
    const starredMessages = starredMessagesArr.map(starredMessage => {
        if (!starredMessage.exists) {
            notExistingMessagesPromises.push(removeStarredMessage(userId, { messageId: starredMessage.id })); // add messageId or messageIdForThread
            return null;
        }
        return { id: starredMessage.id, ...starredMessage.data() }
    }).filter(starredMessage => starredMessage !== null);
    if (notExistingMessagesPromises.length) { // delete not existing any more
        Promise.all(notExistingMessagesPromises);
    }
    return starredMessages;
}

function getStarredMessagesIds(userId) {
    return database.collection('users').doc(userId).collection('userStarredMessages');
}

function getMessage(chatId, messageId, threadMessageId) {
    if (threadMessageId) {
        return database.collection('chats').doc(chatId).collection('messages').doc(messageId).collection('threadMessages').doc(threadMessageId).get();
    } else {
        return database.collection('chats').doc(chatId).collection('messages').doc(messageId).get();
    }
}

function starMessage(userId, message) {
    const messageId = message.threadMessageId || message.messageId;
    return database.collection('users').doc(userId).collection('userStarredMessages').doc(messageId).set(message);
}

function removeStarredMessage(userId, message) {
    const messageId = message.messageIdForThread || message.messageId;
    return database.collection('users').doc(userId).collection('userStarredMessages').doc(messageId).delete();
}

function pinChat(userId, chatId) {
    return database.collection('chats').doc(chatId).update({ pinnedFor: firebase.firestore.FieldValue.arrayUnion(userId) });
}

function unpinChat(userId, chatId) {
    return database.collection('chats').doc(chatId).update({ pinnedFor: firebase.firestore.FieldValue.arrayRemove(userId) });
}

function setTyping(userId, chatId) {
    return database.collection('chats').doc(chatId).update({ typing: firebase.firestore.FieldValue.arrayUnion(userId) });
}

function stopTyping(userId, chatId) {
    return database.collection('chats').doc(chatId).update({ typing: firebase.firestore.FieldValue.arrayRemove(userId) });
}

const objToExport = {
    upsertUserData,
    getUserDetails,
    updateLastSeen,
    searchUsers,
    fetchChatId,
    getConversations,
    getChatsUsers,
    setupChat,
    makeSureThreadIsSetup,
    deleteChat,
    getMessage,
    getMessages,
    getThreadMessages,
    sendMessage,
    sendThreadMessage,
    editMessage,
    editThreadMessage,
    deleteMessage,
    deleteThreadMessage,
    markMessagesReadInConversation,
    markMessagesReadInThread,
    markChatUnread,
    getMessagesUnreadInConversationCount,
    getMessagesUnreadInThreadCount,
    getStarredMessages,
    getStarredMessagesIds,
    starMessage,
    removeStarredMessage,
    pinChat,
    unpinChat,
    setTyping,
    stopTyping
};
export default objToExport;