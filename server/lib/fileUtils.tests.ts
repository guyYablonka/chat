import { fileName } from './fileUtils';

describe('File utils', () => {
    it('should return a valid file name', () => {
        expect(fileName('something')).toEqual('something');
        expect(fileName('some@thing')).toEqual('some@thing');
        expect(fileName('/something')).toEqual('something');
        expect(fileName('/some/thing')).toEqual('some-thing');
        expect(fileName('/some/thing/')).toEqual('some-thing');
        expect(fileName('///some///thing///')).toEqual('some-thing');
        expect(fileName('some/thing')).toEqual('some-thing');
        expect(fileName('some:"thing"')).toEqual('some-thing');
        expect(fileName('some:"thing".txt')).toEqual('some-thing-.txt');
        expect(fileName('some"thing"')).toEqual('some-thing');
        expect(fileName('some\u0000thing')).toEqual('some-thing');
    });
});
