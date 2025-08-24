import fs from 'fs';
import path from 'path';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import postofficeListener from '../../src/listeners/postoffice';
import { STORAGE_KEYS } from '../../src/constants';

global.GM_setValue = vi.fn();

vi.mock('../../src/utils/hud', () => ({
    setHudDetails: vi.fn(),
}));

describe('postofficeListener', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should parse mailbox items correctly', () => {
        const response = fs.readFileSync(path.join(__dirname, "postoffice.html"), "utf8");
        
        const result = postofficeListener.callback(response);

        expect(result).toBe(response);
        expect(GM_setValue).toHaveBeenCalledWith(STORAGE_KEYS.MAILBOX, expect.objectContaining({
            '41840951377': expect.objectContaining({
                id: '41840951377',
                name: 'Lemon Cream Pie',
                count: 12,
            }),
            '41840951327': expect.objectContaining({
                id: '41840951327',
                name: 'Mushroom Stew',
                count: 12,
            }),
        }));
    });

    it('should match postoffice.php URL', () => {
        expect(postofficeListener.urlMatch[0].test('postoffice.php')).toBe(true);
        expect(postofficeListener.urlMatch[0].test('inventory.php')).toBe(false);
    });
});