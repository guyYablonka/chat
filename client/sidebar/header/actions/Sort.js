import React, { useState, useEffect, useRef } from 'react';
import ReactTooltip from 'react-tooltip';
import { ToggleSwitch, Tooltip } from '@rocket.chat/fuselage';

import { useTranslation } from '../../../contexts/TranslationContext';
import { useUserPreference } from '../../../contexts/UserContext';
import { useMethod } from '../../../contexts/ServerContext';

const Sort = props => {
	const t = useTranslation();

	const saveUserPreferences = useMethod('saveUserPreferences');

	const [groupByType, setGroupByType] = useState(
		useUserPreference('sidebarGroupByType')
	);

	const firstUpdate = useRef(true);
	useEffect(() => {
		if (firstUpdate.current) {
			firstUpdate.current = false;
			return;
		}
		ReactTooltip.hide();
		ReactTooltip.show(this.toolRef);
	}, [groupByType]);

	const handleChangeGroupByType = () => {
		setGroupByType(!groupByType);
		saveUserPreferences({ sidebarGroupByType: !groupByType });
	};

	return (
		<>
			<p
				ref={ref => (this.toolRef = ref)}
				data-tip={
					groupByType ? t('Sort_by_timestamp') : t('Group_by_Type')
				}
			>
				<ToggleSwitch
					className="sort-toggle"
					defaultChecked={groupByType}
					onChange={handleChangeGroupByType}
				/>
			</p>
			<ReactTooltip place="bottom" type="dark" effect="solid" />
		</>
	);
};

export default Sort;
