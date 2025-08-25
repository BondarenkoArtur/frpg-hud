import { parseHtml } from "../utils/misc";
import { STORAGE_KEYS } from "../constants";
import { parseNumberWithCommas } from "../utils/numbers";
import { setHudDetails } from "../utils/hud";
import { itemNameIdMap } from "../utils/inventory";

const parseMailbox = (response) => {
    const parsedMailbox = parseHtml(response);
    const mailItems = parsedMailbox.querySelectorAll(".collectbtn");
    const updatedMailbox = {};
    const hudItems = [];

    for (const item of mailItems) {
        const itemId = item.getAttribute("data-id");
        if (!itemId) continue;

        const name = item.querySelector(".item-title > strong").innerText;
        const image = item.querySelector(".item-media > img").src;
        const countText = item.querySelector(".item-after").innerText;
        const count = parseNumberWithCommas(countText.replace("x", ""));

        const mailItem = {
            id: itemId,
            name,
            image,
            count,
        };

        updatedMailbox[itemId] = mailItem;
        
        const inventoryItemId = itemNameIdMap.get(name);
        const hudItem = {
            ...mailItem,
            id: inventoryItemId || itemId,
        };
        
        hudItems.push(hudItem);
    }

    GM_setValue(STORAGE_KEYS.MAILBOX, updatedMailbox);
    
    if (hudItems.length > 0) {
        setHudDetails(hudItems, "postoffice.php");
    }

    return response;
};

const postofficeListener = {
    name: "Post Office",
    callback: parseMailbox,
    urlMatch: [/^postoffice\.php/],
    passive: true,
};

export default postofficeListener;