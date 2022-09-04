import assert from 'assert';

import { escapeRegExp } from './escapeRegExp';

describe('escapeRegExp', () => {
    it('should keep strings with letters only unchanged', () => {
        assert.strictEqual(escapeRegExp('word'), 'word');
    });

    it('should escape slashes', () => {
        assert.strictEqual(escapeRegExp('/slashes/'), '\\/slashes\\/');
        assert.strictEqual(
            escapeRegExp('\\backslashes\\'),
            '\\\\backslashes\\\\'
        );
        assert.strictEqual(
            escapeRegExp('\\border of word'),
            '\\\\border of word'
        );
    });

    it('should not escape whitespace', () => {
        assert.strictEqual(escapeRegExp('\\n\\r\\t'), '\\\\n\\\\r\\\\t');
        assert.strictEqual(escapeRegExp('\n\r\t'), '\n\r\t');
    });
});
