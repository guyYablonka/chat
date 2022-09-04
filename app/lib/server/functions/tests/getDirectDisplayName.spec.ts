import { getDirectDisplayName } from '../getDirectDisplayName';

describe('getDirectDisplayName', () => {
    it('should go with first + last name', () => {
        const displayName = getDirectDisplayName({
            customFields: {
                firstName: 'Phoebe',
                lastName: 'Buffay',
                fullName: 'Some fake full name'
            },
            name: 'Friends/Characters/Some fake display name',
            username: 's1234567'
        });

        expect(displayName).toBe('Phoebe Buffay');
    });

    it('should go with full name', () => {
        const displayName = getDirectDisplayName({
            customFields: { firstName: 'Phoebe', fullName: 'Phoebe Buffay' },
            name: 'Friends/Characters/Some fake display name',
            username: 's1234567'
        });

        expect(displayName).toBe('Phoebe Buffay');
    });

    it('should go with name after last /', () => {
        const displayName = getDirectDisplayName({
            customFields: { lastName: 'Buffay' },
            name: 'Friends/Characters/Phoebe Buffay',
            username: 's1234567'
        });

        expect(displayName).toBe('Phoebe Buffay');
    });

    it('should go with username', () => {
        const displayName = getDirectDisplayName({
            customFields: {},
            name: undefined,
            username: 's1234567'
        });

        expect(displayName).toBe('s1234567');
    });

    it('should return empty string', () => {
        const displayName = getDirectDisplayName({
            customFields: {},
            name: undefined,
            username: undefined
        });

        expect(displayName).toBe('');
    });
});
