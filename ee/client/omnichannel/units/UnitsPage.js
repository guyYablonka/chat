import React from 'react';
import { Button, Icon, ButtonGroup } from '@rocket.chat/fuselage';
import { useMutableCallback } from '@rocket.chat/fuselage-hooks';

import Page from '../../../../client/components/Page';
import { useTranslation } from '../../../../client/contexts/TranslationContext';
import GenericTable from '../../../../client/components/GenericTable';
import { useRoute } from '../../../../client/contexts/RouterContext';
import FilterByText from '../../../../client/components/FilterByText';

function UnitsPage({
	data,
	header,
	setParams,
	params,
	title,
	renderRow,
	children
}) {
	const t = useTranslation();

	const unitsRoute = useRoute('omnichannel-units');

	const handleClick = useMutableCallback(() =>
		unitsRoute.push({
			context: 'new'
		})
	);

	return (
		<Page flexDirection="row">
			<Page>
				<Page.Header title={title}>
					<ButtonGroup>
						<Button onClick={handleClick} title={t('New_Unit')}>
							<Icon name="plus" /> {t('New')}
						</Button>
					</ButtonGroup>
				</Page.Header>
				<Page.Content>
					<GenericTable
						renderFilter={({ onChange, ...props }) => (
							<FilterByText onChange={onChange} {...props} />
						)}
						header={header}
						renderRow={renderRow}
						results={data && data.units}
						total={data && data.total}
						setParams={setParams}
						params={params}
					/>
				</Page.Content>
			</Page>
			{children}
		</Page>
	);
}

export default UnitsPage;
