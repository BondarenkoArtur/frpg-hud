import { seedCrop } from "../constants";
import { inventoryCache } from "../utils/inventory";
import { parseHtml } from "../utils/misc";
import { parseProductionRows } from "../utils/xfarm";


const updateCropCount = (event) => {
    const selectElement = event.target;
    const targetElement = selectElement.parentElement.parentElement.firstElementChild;

    const seedId = selectElement.value;
    const cropName = selectElement.selectedOptions[0].dataset.name?.slice(0, -6);

    if (!cropName) {
        // Show inventory of currently growing crops when no seed is selected
        const growingCropsInventory = getCurrentlyGrowingCropsInventory();
        if (growingCropsInventory.length > 0) {
            targetElement.innerText = growingCropsInventory.join(", ");
        } else {
            targetElement.innerText = "No crop selected";
        }
        return;
    }

    const cropId = seedCrop[seedId] || null;
    const cropInventory = cropId === null ? "??" : inventoryCache[cropId]?.count ?? "??";

    targetElement.innerText = `${cropInventory} ${cropName} in inventory`;
};

const getCurrentlyGrowingCropsInventory = () => {
    try {
        const growingCrops = new Set();
        
        // Check condensed view first
        const condensedCrops = document.querySelectorAll('.concrop .chip-media img');
        if (condensedCrops.length > 0) {
            condensedCrops.forEach(img => {
                const cropName = img.alt;
                if (cropName) growingCrops.add(cropName);
            });
        } else {
            // Fallback to regular view
            const cropItems = document.querySelectorAll('.cropitem img');
            cropItems.forEach(img => {
                const alt = img.alt;
                if (alt && alt !== 'Plant' && !alt.includes('Empty')) {
                    growingCrops.add(alt);
                }
            });
        }
        
        // Get inventory counts for growing crops
        const cropInventories = [];
        growingCrops.forEach(cropName => {
            // Find crop ID by name from inventoryCache
            let cropCount = "??";
            for (const [, item] of Object.entries(inventoryCache)) {
                if (item.name === cropName) {
                    cropCount = item.count ?? "??";
                    break;
                }
            }
            cropInventories.push(`${cropCount} ${cropName} in inventory`);
        });
        
        return cropInventories;
    } catch (error) {
        console.warn('Could not parse growing crops inventory:', error);
        return [];
    }
};
unsafeWindow.updateCropCount = updateCropCount;

const parseFarm = (response) => {
    const parsedResponse = parseHtml(response);
    const cropSelect = parsedResponse.querySelector("select.seedid");
    if (cropSelect) {
        cropSelect.setAttribute("onchange", "updateCropCount(event)");
        updateCropCount({ target: cropSelect });
    }

    parseProductionRows(parsedResponse);

    return parsedResponse.innerHTML;
};

const xfarmListener = {
    name: "Farm",
    callback: parseFarm,
    urlMatch: [/^xfarm\.php\?id=/],
    passive: false,
};

export default xfarmListener;
