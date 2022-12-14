import assert from 'assert';

import { unescapeHTML } from './unescapeHTML';

describe('unescapeHTML', () => {
    it('should unescape to normal html', () => {
        assert.strictEqual(
            unescapeHTML(
                '&lt;div&gt;Blah &amp; &quot;blah&quot; &amp; &apos;blah&#39;&lt;/div&gt;'
            ),
            '<div>Blah & "blah" & \'blah\'</div>'
        );
    });

    it('should unescape characters', () => {
        assert.strictEqual(unescapeHTML('&amp;lt;'), '&lt;');
        assert.strictEqual(unescapeHTML('&apos;'), "'");
        assert.strictEqual(unescapeHTML('&#39;'), "'");
        assert.strictEqual(unescapeHTML('&#0039;'), "'");
        assert.strictEqual(unescapeHTML('&#x4a;'), 'J');
        assert.strictEqual(unescapeHTML('&#x04A;'), 'J');
        assert.strictEqual(unescapeHTML('&#X4A;'), '&#X4A;');
        assert.strictEqual(unescapeHTML('&_#39;'), '&_#39;');
        assert.strictEqual(unescapeHTML('&#39_;'), '&#39_;');
        assert.strictEqual(unescapeHTML('&amp;#38;'), '&#38;');
        assert.strictEqual(unescapeHTML('&#38;amp;'), '&amp;');
        assert.strictEqual(unescapeHTML('&#39;'), "'");
    });

    it('should unescape text with special characters', () => {
        assert.strictEqual(
            unescapeHTML(
                'what is the &yen; to &pound; to &euro; conversion process?'
            ),
            'what is the ¥ to £ to € conversion process?'
        );
        assert.strictEqual(
            unescapeHTML('&copy; 1992. License available for 50 &cent;'),
            '© 1992. License available for 50 ¢'
        );
        assert.strictEqual(unescapeHTML('&reg; trademark'), '® trademark');
    });

    it('should unescape to blank', () => {
        assert.strictEqual(unescapeHTML(''), '');
        assert.strictEqual(unescapeHTML('&nbsp;'), ' ');
        assert.strictEqual(unescapeHTML('&nbsp;'), ' ');
        assert.strictEqual(unescapeHTML('&nbsp;'), ' ');
        assert.strictEqual(unescapeHTML(null as unknown as string), '');
        assert.strictEqual(unescapeHTML(undefined as unknown as string), '');
    });

    it('should escape numbers', () => {
        assert.strictEqual(unescapeHTML(5 as unknown as string), '5');
    });
});
