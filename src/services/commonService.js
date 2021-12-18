import { get } from 'lodash';
import * as moment from 'moment';

const WEEK_DAYS_DIC = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function generateRandomString(size) {
    if (size === 0) {
        throw new Error('Zero-length randomString is useless.');
    }
    let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomStr = '';
    for (let i = 0; i < size; ++i) {
        randomStr += chars[Math.floor(Math.random() * chars.length)];
    }
    return randomStr;
}

function getMessageTimeFromSeconds(seconds) {
    if (!seconds) {
        return '';
    }
    const dateObj = new Date(parseInt(seconds * 1000));
    return `${numberAsTwoDigits(dateObj.getHours())}:${numberAsTwoDigits(dateObj.getMinutes())}`;
}

function getTimeFromSeconds(seconds) {
    if (!seconds) {
        return '';
    }
    const dateObj = new Date(parseInt(seconds * 1000));
    const differenceInDays = getDifferenceInDays(dateObj, new Date());
    if (differenceInDays < 1) {
        return `${numberAsTwoDigits(dateObj.getHours())}:${numberAsTwoDigits(dateObj.getMinutes())}`;
    }
    if (differenceInDays <= 2 && differenceInDays > 1) {
        return 'Yesterday';
    }
    if (differenceInDays <= 6 && differenceInDays > 2) {
        const dayOfWeek = dateObj.getDay();
        return WEEK_DAYS_DIC[dayOfWeek];
    }
    return `${numberAsTwoDigits(dateObj.getDate())}-${numberAsTwoDigits(dateObj.getMonth()+1)}-${numberAsTwoDigits(dateObj.getFullYear())}`
}

function numberAsTwoDigits(number) {
    return number < 10 ? `0${number}` : number;
}

function getLastSeenString(lastSeen) {
    if (lastSeen && lastSeen === 'Online') {
        return lastSeen;
    }
    if (!lastSeen || !lastSeen.seconds) {
        return '';
    }
    return moment(lastSeen.seconds * 1000).fromNow();
}

function getThreadPreviewText(threadMessages) {
    if (!threadMessages || !threadMessages.length) {
        return `Leave a comment`;
    } else if (threadMessages.length === 1) {
        return `1 comment`;
    } else {
        return `${threadMessages.length} comments`;
    }
}

function addDatesSeparatorsToMessagesList(messagesArr) {
    let newMessageArr = [];
    if (!messagesArr || !messagesArr.length) {
        return messagesArr;
    }

    let firstTimestamp = get(messagesArr, '[0].time.seconds', null);
    if (!firstTimestamp) {
        return messagesArr;
    }
    const firstDateObj = new Date(firstTimestamp * 1000);
    let firstFormattedDate = getFormattedDateFromDateObj(firstDateObj);
    newMessageArr.push({ isDateBetweenMessages: true, date: firstFormattedDate });

    for (let i = 0; i < messagesArr.length; i++) {
        const message = messagesArr[i];
        if (!message.time || !message.time.seconds) {
            continue;
        }
        const dateObj = new Date(message.time.seconds * 1000);
        const currentFormattedDate = getFormattedDateFromDateObj(dateObj);
        if (currentFormattedDate !== firstFormattedDate) {
            // insert to the i element in the array - { isDateBetweenMessages: true, date: formattedDate }
            newMessageArr.push({ isDateBetweenMessages: true, date: currentFormattedDate });
            firstFormattedDate = currentFormattedDate;
        }
        newMessageArr.push(messagesArr[i]);
    }
    return newMessageArr;
}

function getFormattedDateFromDateObj(dateObj) {
    const differenceInDays = getDifferenceInDays(dateObj, new Date());
    if (differenceInDays < 1) {
        return 'Today';
    }
    if (differenceInDays <= 2 && differenceInDays > 1) {
        return 'Yesterday';
    }
    return `${numberAsTwoDigits(dateObj.getDate())}-${numberAsTwoDigits(dateObj.getMonth()+1)}-${numberAsTwoDigits(dateObj.getFullYear())}`
}

function getDifferenceInDays(dateObj1, dateObj2) {
    const differenceInTime = dateObj2.getTime() - dateObj1.getTime();
    return differenceInTime / (1000 * 3600 * 24);
}

function sortChatsListByPinned(conversationsArr) {
    const pinnedChats = [];
    for (let i = 0; i < conversationsArr.length; i++) {
        const currentConversation = conversationsArr[i];
        if (currentConversation.isPinned) {
            conversationsArr.splice(i, 1); // remove from original array
            pinnedChats.push(currentConversation); // insert to pinned messages
        }
    }
    return [...pinnedChats, ...conversationsArr];
}

export {
    generateRandomString,
    getMessageTimeFromSeconds,
    getTimeFromSeconds,
    getLastSeenString,
    getThreadPreviewText,
    addDatesSeparatorsToMessagesList,
    sortChatsListByPinned
};
