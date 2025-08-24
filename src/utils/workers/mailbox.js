import { updateInventory } from "../inventory";
import { STORAGE_KEYS } from "../../constants";

const handleCollectMailItem = (response, parameters) => {
    if (response !== "success") return;

    const itemId = parameters.get("id");
    const mailboxCache = GM_getValue(STORAGE_KEYS.MAILBOX, {});
    const mailItem = mailboxCache[itemId];

    if (!mailItem) return;

    // Add collected item to inventory
    updateInventory({ [mailItem.name]: mailItem.count }, { 
        isAbsolute: false, 
        resolveNames: true,
        processCraftworks: true 
    });

    // Remove from mailbox cache
    delete mailboxCache[itemId];
    GM_setValue(STORAGE_KEYS.MAILBOX, mailboxCache);
};

const handleCollectAllMailItems = (response) => {
    if (response !== "success") return;

    const mailboxCache = GM_getValue(STORAGE_KEYS.MAILBOX, {});
    const updateBatch = {};

    for (const mailItem of Object.values(mailboxCache)) {
        updateBatch[mailItem.name] = (updateBatch[mailItem.name] || 0) + mailItem.count;
    }

    if (Object.keys(updateBatch).length > 0) {
        updateInventory(updateBatch, { 
            isAbsolute: false, 
            resolveNames: true,
            processCraftworks: true 
        });
    }

    // Clear mailbox cache
    GM_setValue(STORAGE_KEYS.MAILBOX, {});
};

const mailboxWorkers = [
    {
        action: "collectmailitem",
        listener: handleCollectMailItem,
    },
    {
        action: "collectallmailitems",
        listener: handleCollectAllMailItems,
    },
];

export default mailboxWorkers;