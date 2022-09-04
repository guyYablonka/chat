import React from 'react';
import { Sidebar } from '@rocket.chat/fuselage';

import Home from './actions/Home';
import Search from './actions/Search';
import Sort from './actions/Sort';
import CreateRoom from './actions/CreateRoom';
import Login from './actions/Login';
import UserAvatarButton from './UserAvatarButton';
import { useUser } from '../../contexts/UserContext';
import { useSidebarPaletteColor } from '../hooks/useSidebarPaletteColor';
import { useTranslation } from '../../contexts/TranslationContext';

const HeaderWithData = () => {
	const user = useUser();
	const t = useTranslation();

	useSidebarPaletteColor();
	return (
		<>
			<Sidebar.TopBar.Section className="sidebar--custom-colors">
				<UserAvatarButton user={user} />
				<Sidebar.TopBar.Actions>
					<Home data-title={t('Home')} />
					<Search data-title={t('Search')} data-qa="sidebar-search" />
					{user && (
						<>
							<CreateRoom
								data-title={t('Create_A_New_Channel')}
								data-qa="sidebar-create"
							/>
							<Sort />
						</>
					)}
					{!user && <Login data-title={t('Login')} />}
				</Sidebar.TopBar.Actions>
			</Sidebar.TopBar.Section>
		</>
	);
};

export default React.memo(HeaderWithData);
