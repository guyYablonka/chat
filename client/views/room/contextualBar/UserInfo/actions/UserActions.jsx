import React, { useMemo } from 'react';

import {
	useUserInfoActions,
	useUserInfoActionsSpread
} from '../../../hooks/useUserInfoActions';
import { UserInfo } from '..';

const UserActions = ({ user, rid }) => {
	const { actions: actionsDefinition } = useUserInfoActionsSpread(
		useUserInfoActions(user, rid)
	);

	const actions = useMemo(() => {
		const mapAction = ([key, { label, icon, action, ...props }]) => (
			<UserInfo.Action
				key={key}
				title={label}
				label={label}
				onClick={action}
				icon={icon}
				{...props}
			/>
		);

		return [...actionsDefinition.map(mapAction)].filter(Boolean);
	}, [actionsDefinition]);

	return <>{actions}</>;
};

export default UserActions;
