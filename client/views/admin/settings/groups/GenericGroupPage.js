import React, { memo } from 'react';

import GroupPage from '../GroupPage';
import { Section } from '../Section';
import { useEditableSettingsGroupSections } from '../../../../contexts/EditableSettingsContext';

function GenericGroupPage({ _id, ...group }) {
	const sections = useEditableSettingsGroupSections(_id);
	const solo = sections.length === 1;

	return (
		<GroupPage _id={_id} {...group}>
			{sections.map(sectionName => (
				<Section
					key={sectionName || ''}
					groupId={_id}
					sectionName={sectionName}
					solo={solo}
				/>
			))}
		</GroupPage>
	);
}

export default memo(GenericGroupPage);
