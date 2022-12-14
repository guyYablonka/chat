import { Box, Field, Flex, InputBox } from '@rocket.chat/fuselage';
import React from 'react';

import { ResetSettingButton } from '../ResetSettingButton';

export function IntSettingInput({
	_id,
	label,
	value,
	placeholder,
	readonly,
	autocomplete,
	disabled,
	onChangeValue,
	hasResetButton,
	onResetButtonClick
}) {
	const handleChange = event => {
		onChangeValue && onChangeValue(parseInt(event.currentTarget.value, 10));
	};

	return (
		<>
			<Flex.Container>
				<Box>
					<Field.Label htmlFor={_id} title={_id}>
						{label}
					</Field.Label>
					{hasResetButton && (
						<ResetSettingButton
							data-qa-reset-setting-id={_id}
							onClick={onResetButtonClick}
						/>
					)}
				</Box>
			</Flex.Container>
			<Field.Row>
				<InputBox
					data-qa-setting-id={_id}
					id={_id}
					type="number"
					value={value}
					placeholder={placeholder}
					disabled={disabled}
					readOnly={readonly}
					autoComplete={autocomplete === false ? 'off' : undefined}
					onChange={handleChange}
				/>
			</Field.Row>
		</>
	);
}
