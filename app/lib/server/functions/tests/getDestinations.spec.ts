import { IRoom } from '../../../../../definition/IRoom';
import { IUser } from '../../../../../definition/IUser';
import { getDestinations } from '../getDestinations';

jest.mock('../../../../settings/server', () => ({
    settings: {
        get: () => JSON.stringify(['aman-user', 'masoah-user'])
    }
}));

type UserTest = Pick<IUser, 'roles'> & {
    username: NonNullable<IUser['username']>;
};

const users: UserTest[] = [
    {
        username: 'test-user-1',
        roles: ['user', 'aman-user']
    },
    {
        username: 'test-user-2',
        roles: ['user', 'masoah-user']
    },
    {
        username: 'test-user-3',
        roles: ['user', 'mobile-user']
    },
    {
        username: 'test-user-4',
        roles: ['user', 'aman-user', 'masoah-user']
    },
    {
        username: 'test-user-5',
        roles: ['user']
    },
    {
        username: 'test-user-6',
        roles: ['user', 'mobile-user', 'aman-user', 'user-creator']
    },
    {
        username: 'test-user-7',
        roles: ['aman-user', 'user']
    }
];

jest.mock('../../../../models/server', () => ({
    Users: {
        findByUsernames: (usernames: string[]) =>
            users.filter(({ username }) => usernames.includes(username))
    }
}));

type Destinations = IRoom['destinations'];

describe('getDestinations', () => {
    beforeEach(() => jest.clearAllMocks());

    describe('empty array', () => {
        it('should return empty object', () => {
            const destinations = getDestinations([]);

            expect(destinations).toEqual({});
        });
    });

    describe('array without any destination types', () => {
        let destinations: Destinations = {};

        beforeAll(() => {
            destinations = getDestinations(['test-user-3', 'test-user-5']);
        });

        it('should not have aman-user destination', () => {
            expect(destinations).not.toHaveProperty('aman-user');
        });

        it('should not have masoah-user destination', () => {
            expect(destinations).not.toHaveProperty('masoah-user');
        });

        it('should not have non-destination keys', () => {
            expect(destinations).not.toHaveProperty('user');
            expect(destinations).not.toHaveProperty('mobile-user');
            expect(destinations).not.toHaveProperty('user-creator');
        });
    });

    describe('array with single destination type', () => {
        let destinations: Destinations = {};

        beforeAll(() => {
            destinations = getDestinations([
                'test-user-1',
                'test-user-3',
                'test-user-5',
                'test-user-6',
                'test-user-7'
            ]);
        });

        it('should have aman-user destination', () => {
            expect(destinations).toHaveProperty('aman-user', 3);
        });

        it('should not have masoah-user destination', () => {
            expect(destinations).not.toHaveProperty('masoah-user');
        });

        it('should not have non-destination keys', () => {
            expect(destinations).not.toHaveProperty('user');
            expect(destinations).not.toHaveProperty('mobile-user');
            expect(destinations).not.toHaveProperty('user-creator');
        });
    });

    describe('array with multiple destination types', () => {
        let destinations: Destinations = {};

        beforeAll(() => {
            destinations = getDestinations([
                'test-user-1',
                'test-user-2',
                'test-user-3',
                'test-user-4',
                'test-user-5',
                'test-user-6',
                'test-user-7'
            ]);
        });

        it('should have aman-user destination', () => {
            expect(destinations).toHaveProperty('aman-user', 4);
        });

        it('should have masoah-user destination', () => {
            expect(destinations).toHaveProperty('masoah-user', 2);
        });

        it('should not have non-destination keys', () => {
            expect(destinations).not.toHaveProperty('user');
            expect(destinations).not.toHaveProperty('mobile-user');
            expect(destinations).not.toHaveProperty('user-creator');
        });
    });
});
