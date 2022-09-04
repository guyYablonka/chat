import { HTML } from 'meteor/htmljs';

import { hasPermission } from '../../../app/authorization/client';
import { createTemplateForComponent } from '../../reactAdapters';
import { settings } from '../../../app/settings';
import { createSidebarItems } from '../../lib/createSidebarItems';

createTemplateForComponent('accountFlex', () => import('./AccountSidebar'), {
	renderContainerView: () =>
		HTML.DIV({ style: 'height: 100%; position: relative;' }) // eslint-disable-line new-cap
});

export const {
	registerSidebarItem: registerAccountSidebarItem,
	unregisterSidebarItem,
	itemsSubscription
} = createSidebarItems([
	{
		pathSection: 'account',
		pathGroup: 'profile',
		i18nLabel: 'Profile',
		icon: 'user'
	},
	{
		pathSection: 'account',
		pathGroup: 'preferences',
		i18nLabel: 'Preferences',
		icon: 'customize'
	}
]);
