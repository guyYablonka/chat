import { Meteor } from 'meteor/meteor';

import { Settings } from './settings.mocks';
import { settings } from './settings';

describe('Settings', () => {
    beforeEach(() => {
        Settings.upsertCalls = 0;
        Settings.data.clear();
        Meteor.settings = { public: {} };
        process.env = {};
    });

    it('should not insert the same setting twice', () => {
        settings.addGroup('group', function () {
            this.section('section', function () {
                this.add('my_setting', true, {
                    type: 'boolean',
                    sorter: 0
                });
            });
        });

        expect(Settings.data.size).toBe(2);
        expect(Settings.upsertCalls).toBe(2);
        expect(Settings.findOne({ _id: 'my_setting' })).toMatchObject({
            type: 'boolean',
            sorter: 0,
            group: 'group',
            section: 'section',
            packageValue: true,
            value: true,
            valueSource: 'packageValue',
            hidden: false,
            blocked: false,
            secret: false,
            i18nLabel: 'my_setting',
            i18nDescription: 'my_setting_Description',
            autocomplete: true
        });

        settings.addGroup('group', function () {
            this.section('section', function () {
                this.add('my_setting', true, {
                    type: 'boolean',
                    sorter: 0
                });
            });
        });

        expect(Settings.data.size).toBe(2);
        expect(Settings.upsertCalls).toBe(2);
        expect(Settings.findOne({ _id: 'my_setting' }).value).toBe(true);

        settings.addGroup('group', function () {
            this.section('section', function () {
                this.add('my_setting2', false, {
                    type: 'boolean',
                    sorter: 0
                });
            });
        });

        expect(Settings.data.size).toBe(3);
        expect(Settings.upsertCalls).toBe(3);
        expect(Settings.findOne({ _id: 'my_setting' }).value).toBe(true);
        expect(Settings.findOne({ _id: 'my_setting2' }).value).toBe(false);
    });

    it('should respect override via environment as int', () => {
        process.env.OVERWRITE_SETTING_my_setting = '1';

        settings.addGroup('group', function () {
            this.section('section', function () {
                this.add('my_setting', 0, {
                    type: 'int',
                    sorter: 0
                });
            });
        });

        const expectedSetting = {
            value: 1,
            processEnvValue: 1,
            valueSource: 'processEnvValue',
            type: 'int',
            sorter: 0,
            group: 'group',
            section: 'section',
            packageValue: 0,
            hidden: false,
            blocked: false,
            secret: false,
            i18nLabel: 'my_setting',
            i18nDescription: 'my_setting_Description',
            autocomplete: true
        };

        expect(Settings.data.size).toBe(2);
        expect(Settings.upsertCalls).toBe(2);
        expect(Settings.findOne({ _id: 'my_setting' })).toMatchObject(
            expectedSetting
        );

        process.env.OVERWRITE_SETTING_my_setting = '2';

        settings.addGroup('group', function () {
            this.section('section', function () {
                this.add('my_setting', 0, {
                    type: 'int',
                    sorter: 0
                });
            });
        });

        expectedSetting.value = 2;
        expectedSetting.processEnvValue = 2;

        expect(Settings.data.size).toBe(2);
        expect(Settings.upsertCalls).toBe(3);
        expect(Settings.findOne({ _id: 'my_setting' })).toMatchObject(
            expectedSetting
        );
    });

    it('should respect override via environment as boolean', () => {
        process.env.OVERWRITE_SETTING_my_setting_bool = 'true';

        settings.addGroup('group', function () {
            this.section('section', function () {
                this.add('my_setting_bool', false, {
                    type: 'boolean',
                    sorter: 0
                });
            });
        });

        const expectedSetting = {
            value: true,
            processEnvValue: true,
            valueSource: 'processEnvValue',
            type: 'boolean',
            sorter: 0,
            group: 'group',
            section: 'section',
            packageValue: false,
            hidden: false,
            blocked: false,
            secret: false,
            i18nLabel: 'my_setting_bool',
            i18nDescription: 'my_setting_bool_Description',
            autocomplete: true
        };

        expect(Settings.data.size).toBe(2);
        expect(Settings.upsertCalls).toBe(2);
        expect(Settings.findOne({ _id: 'my_setting_bool' })).toMatchObject(
            expectedSetting
        );

        process.env.OVERWRITE_SETTING_my_setting_bool = 'false';

        settings.addGroup('group', function () {
            this.section('section', function () {
                this.add('my_setting_bool', false, {
                    type: 'boolean',
                    sorter: 0
                });
            });
        });

        expectedSetting.value = false;
        expectedSetting.processEnvValue = false;

        expect(Settings.data.size).toBe(2);
        expect(Settings.upsertCalls).toBe(3);
        expect(Settings.findOne({ _id: 'my_setting_bool' })).toMatchObject(
            expectedSetting
        );
    });

    it('should respect override via environment as string', () => {
        process.env.OVERWRITE_SETTING_my_setting_str = 'hey';

        settings.addGroup('group', function () {
            this.section('section', function () {
                this.add('my_setting_str', '', {
                    type: 'string',
                    sorter: 0
                });
            });
        });

        const expectedSetting = {
            value: 'hey',
            processEnvValue: 'hey',
            valueSource: 'processEnvValue',
            type: 'string',
            sorter: 0,
            group: 'group',
            section: 'section',
            packageValue: '',
            hidden: false,
            blocked: false,
            secret: false,
            i18nLabel: 'my_setting_str',
            i18nDescription: 'my_setting_str_Description',
            autocomplete: true
        };

        expect(Settings.data.size).toBe(2);
        expect(Settings.upsertCalls).toBe(2);
        expect(Settings.findOne({ _id: 'my_setting_str' })).toMatchObject(
            expectedSetting
        );

        process.env.OVERWRITE_SETTING_my_setting_str = 'hey ho';

        settings.addGroup('group', function () {
            this.section('section', function () {
                this.add('my_setting_str', 'hey', {
                    type: 'string',
                    sorter: 0
                });
            });
        });

        expectedSetting.value = 'hey ho';
        expectedSetting.processEnvValue = 'hey ho';
        expectedSetting.packageValue = 'hey';

        expect(Settings.data.size).toBe(2);
        expect(Settings.upsertCalls).toBe(3);
        expect(Settings.findOne({ _id: 'my_setting_str' })).toMatchObject(
            expectedSetting
        );
    });

    it('should respect initial value via environment', () => {
        process.env.my_setting = '1';

        settings.addGroup('group', function () {
            this.section('section', function () {
                this.add('my_setting', 0, {
                    type: 'int',
                    sorter: 0
                });
            });
        });

        const expectedSetting = {
            value: 1,
            processEnvValue: 1,
            valueSource: 'processEnvValue',
            type: 'int',
            sorter: 0,
            group: 'group',
            section: 'section',
            packageValue: 0,
            hidden: false,
            blocked: false,
            secret: false,
            i18nLabel: 'my_setting',
            i18nDescription: 'my_setting_Description',
            autocomplete: true
        };

        expect(Settings.data.size).toBe(2);
        expect(Settings.upsertCalls).toBe(2);
        expect(Settings.findOne({ _id: 'my_setting' })).toMatchObject(
            expectedSetting
        );

        process.env.my_setting = '2';

        settings.addGroup('group', function () {
            this.section('section', function () {
                this.add('my_setting', 0, {
                    type: 'int',
                    sorter: 0
                });
            });
        });

        expectedSetting.processEnvValue = 2;

        expect(Settings.data.size).toBe(2);
        expect(Settings.upsertCalls).toBe(3);
        expect(Settings.findOne({ _id: 'my_setting' })).toMatchObject(
            expectedSetting
        );
    });

    it('should respect initial value via Meteor.settings', () => {
        Meteor.settings.my_setting = 1;

        settings.addGroup('group', function () {
            this.section('section', function () {
                this.add('my_setting', 0, {
                    type: 'int',
                    sorter: 0
                });
            });
        });

        const expectedSetting = {
            value: 1,
            meteorSettingsValue: 1,
            valueSource: 'meteorSettingsValue',
            type: 'int',
            sorter: 0,
            group: 'group',
            section: 'section',
            packageValue: 0,
            hidden: false,
            blocked: false,
            secret: false,
            i18nLabel: 'my_setting',
            i18nDescription: 'my_setting_Description',
            autocomplete: true
        };

        expect(Settings.data.size).toBe(2);
        expect(Settings.upsertCalls).toBe(2);
        expect(Settings.findOne({ _id: 'my_setting' })).toMatchObject(
            expectedSetting
        );

        Meteor.settings.my_setting = 2;

        settings.addGroup('group', function () {
            this.section('section', function () {
                this.add('my_setting', 0, {
                    type: 'int',
                    sorter: 0
                });
            });
        });

        expectedSetting.meteorSettingsValue = 2;

        expect(Settings.data.size).toBe(2);
        expect(Settings.upsertCalls).toBe(3);
        expect(Settings.findOne({ _id: 'my_setting' })).toMatchObject(
            expectedSetting
        );
    });

    it('should keep original value if value on code was changed', () => {
        settings.addGroup('group', function () {
            this.section('section', function () {
                this.add('my_setting', 0, {
                    type: 'int',
                    sorter: 0
                });
            });
        });

        const expectedSetting = {
            value: 0,
            valueSource: 'packageValue',
            type: 'int',
            sorter: 0,
            group: 'group',
            section: 'section',
            packageValue: 0,
            hidden: false,
            blocked: false,
            secret: false,
            i18nLabel: 'my_setting',
            i18nDescription: 'my_setting_Description',
            autocomplete: true
        };

        expect(Settings.data.size).toBe(2);
        expect(Settings.upsertCalls).toBe(2);
        expect(Settings.findOne({ _id: 'my_setting' })).toMatchObject(
            expectedSetting
        );
    });

    it('should change group and section', () => {
        settings.addGroup('group', function () {
            this.section('section', function () {
                this.add('my_setting', 0, {
                    type: 'int',
                    sorter: 0
                });
            });
        });

        const expectedSetting = {
            value: 0,
            valueSource: 'packageValue',
            type: 'int',
            sorter: 0,
            group: 'group',
            section: 'section',
            packageValue: 0,
            hidden: false,
            blocked: false,
            secret: false,
            i18nLabel: 'my_setting',
            i18nDescription: 'my_setting_Description',
            autocomplete: true
        };

        expect(Settings.data.size).toBe(2);
        expect(Settings.upsertCalls).toBe(2);
        expect(Settings.findOne({ _id: 'my_setting' })).toMatchObject(
            expectedSetting
        );

        settings.addGroup('group2', function () {
            this.section('section2', function () {
                this.add('my_setting', 0, {
                    type: 'int',
                    sorter: 0
                });
            });
        });

        expectedSetting.group = 'group2';
        expectedSetting.section = 'section2';

        expect(Settings.data.size).toBe(3);
        expect(Settings.upsertCalls).toBe(4);
        expect(Settings.findOne({ _id: 'my_setting' })).toMatchObject(
            expectedSetting
        );
    });

    it.skip('should call `settings.get` callback on setting added', () => {
        const spy = jest.spyOn(settings, 'get');

        settings.addGroup('group', function () {
            this.section('section', function () {
                this.add('setting_callback', 'value1', {
                    type: 'string'
                });
            });
        });

        expect(spy).toBeCalledTimes(2);
        expect(spy).toBeCalledWith('setting_callback', 'value1');
    });

    it.skip('should call `settings.get` callback on setting changed', () => {
        const spy = jest.spyOn(settings, 'get');

        settings.addGroup('group', function () {
            this.section('section', function () {
                this.add('setting_callback', 'value2', {
                    type: 'string'
                });
            });
        });

        settings.updateById('setting_callback', 'value3');

        expect(spy).toBeCalledTimes(6);
        expect(spy).toBeCalledWith('setting_callback', 'value2');
        expect(spy).toBeCalledWith('setting_callback', 'value3');
    });
});
