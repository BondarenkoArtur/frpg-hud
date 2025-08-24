import { describe, it, expect, beforeEach, vi } from 'vitest';
import mailboxWorkers from '../../../src/utils/workers/mailbox';
import { updateInventory } from '../../../src/utils/inventory';
import { STORAGE_KEYS } from '../../../src/constants';

global.GM_getValue = vi.fn();
global.GM_setValue = vi.fn();

vi.mock('../../../src/utils/inventory', () => ({
    updateInventory: vi.fn(),
}));

describe('mailboxWorkers', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should handle collectmailitem successfully', () => {
        const mockMailboxCache = {
            '41840951377': {
                id: '41840951377',
                name: 'Lemon Cream Pie',
                count: 12,
            },
        };

        GM_getValue.mockReturnValue(mockMailboxCache);
        
        const parameters = new URLSearchParams('id=41840951377');
        const worker = mailboxWorkers.find(w => w.action === 'collectmailitem');
        
        worker.listener('success', parameters);

        expect(updateInventory).toHaveBeenCalledWith(
            { 'Lemon Cream Pie': 12 },
            { isAbsolute: false, resolveNames: true, processCraftworks: true }
        );
        expect(GM_setValue).toHaveBeenCalledWith(STORAGE_KEYS.MAILBOX, {});
    });

    it('should not process non-success response', () => {
        const parameters = new URLSearchParams('id=41840951377');
        const worker = mailboxWorkers.find(w => w.action === 'collectmailitem');
        
        worker.listener('error', parameters);

        expect(updateInventory).not.toHaveBeenCalled();
        expect(GM_setValue).not.toHaveBeenCalled();
    });

    it('should handle collectallmailitems successfully', () => {
        const mockMailboxCache = {
            '41840951377': { name: 'Lemon Cream Pie', count: 12 },
            '41840951327': { name: 'Mushroom Stew', count: 5 },
        };

        GM_getValue.mockReturnValue(mockMailboxCache);
        
        const worker = mailboxWorkers.find(w => w.action === 'collectallmailitems');
        
        worker.listener('success');

        expect(updateInventory).toHaveBeenCalledWith(
            { 'Lemon Cream Pie': 12, 'Mushroom Stew': 5 },
            { isAbsolute: false, resolveNames: true, processCraftworks: true }
        );
        expect(GM_setValue).toHaveBeenCalledWith(STORAGE_KEYS.MAILBOX, {});
    });
});