import React, { useCallback, useMemo, useEffect, useState } from 'react';
import {
	Field,
	FieldGroup,
	TextInput,
	TextAreaInput,
	Box,
	Icon,
	AnimatedVisibility,
	PasswordInput,
	Button,
	Grid,
	Margins
} from '@rocket.chat/fuselage';
import { useDebouncedCallback, useSafely } from '@rocket.chat/fuselage-hooks';

import { useTranslation } from '../../contexts/TranslationContext';
import { isEmail } from '../../../app/utils/lib/isEmail.js';
import { useToastMessageDispatch } from '../../contexts/ToastMessagesContext';
import { useMethod } from '../../contexts/ServerContext';
import { getUserEmailAddress } from '../../lib/getUserEmailAddress';
import { UserAvatarEditor } from '../../components/avatar/UserAvatarEditor';
import CustomFieldsForm from '../../components/CustomFieldsForm';
import UserStatusMenu from '../../components/UserStatusMenu';

const STATUS_TEXT_MAX_LENGTH = 120;

function AccountProfileForm({
	values,
	handlers,
	user,
	settings,
	onSaveStateChange,
	...props
}) {
	const t = useTranslation();
	const dispatchToastMessage = useToastMessageDispatch();

	const checkUsernameAvailability = useMethod('checkUsernameAvailability');
	const getAvatarSuggestions = useMethod('getAvatarSuggestion');
	const sendConfirmationEmail = useMethod('sendConfirmationEmail');

	const [usernameError, setUsernameError] = useState();
	const [avatarSuggestions, setAvatarSuggestions] = useSafely(useState());

	const {
		allowRealNameChange,
		allowUserStatusMessageChange,
		allowEmailChange,
		allowPasswordChange,
		allowUserAvatarChange,
		canChangeUsername,
		namesRegex,
		requireName
	} = settings;

	const {
		realname,
		email,
		username,
		password,
		confirmationPassword,
		statusText,
		bio,
		statusType,
		customFields,
		nickname
	} = values;

	const {
		handleRealname,
		handleEmail,
		handleUsername,
		handlePassword,
		handleConfirmationPassword,
		handleAvatar,
		handleStatusText,
		handleStatusType,
		handleBio,
		handleCustomFields,
		handleNickname
	} = handlers;

	const previousEmail = getUserEmailAddress(user);

	const handleSendConfirmationEmail = useCallback(async () => {
		if (email !== previousEmail) {
			return;
		}
		try {
			await sendConfirmationEmail(email);
			dispatchToastMessage({
				type: 'success',
				message: t('Verification_email_sent')
			});
		} catch (error) {
			dispatchToastMessage({ type: 'error', message: error });
		}
	}, [dispatchToastMessage, email, previousEmail, sendConfirmationEmail, t]);

	const passwordError = useMemo(
		() =>
			!password ||
			!confirmationPassword ||
			password === confirmationPassword
				? undefined
				: t('Passwords_do_not_match'),
		[t, password, confirmationPassword]
	);
	const emailError = useMemo(
		() => (isEmail(email) ? undefined : 'error-invalid-email-address'),
		[email]
	);
	const checkUsername = useDebouncedCallback(
		async username => {
			if (user.username === username) {
				return setUsernameError(undefined);
			}
			if (!namesRegex.test(username)) {
				return setUsernameError(t('error-invalid-username'));
			}
			const isAvailable = await checkUsernameAvailability(username);
			if (!isAvailable) {
				return setUsernameError(t('Username_already_exist'));
			}
			setUsernameError(undefined);
		},
		400,
		[
			namesRegex,
			t,
			user.username,
			checkUsernameAvailability,
			setUsernameError
		]
	);

	useEffect(() => {
		const getSuggestions = async () => {
			const suggestions = await getAvatarSuggestions();
			setAvatarSuggestions(suggestions);
		};
		getSuggestions();
	}, [getAvatarSuggestions, setAvatarSuggestions]);

	useEffect(() => {
		checkUsername(username);
	}, [checkUsername, username]);

	useEffect(() => {
		if (!password) {
			handleConfirmationPassword('');
		}
	}, [password, handleConfirmationPassword]);

	const nameError = useMemo(() => {
		if (user.name === realname) {
			return undefined;
		}
		if (!realname && requireName) {
			return t('Field_required');
		}
	}, [realname, requireName, t, user.name]);

	const statusTextError = useMemo(
		() =>
			!statusText ||
			statusText.length <= STATUS_TEXT_MAX_LENGTH ||
			statusText.length === 0
				? undefined
				: t('Max_length_is', STATUS_TEXT_MAX_LENGTH),
		[statusText, t]
	);
	const {
		emails: [{ verified = false }]
	} = user;

	const canSave = !![
		!!passwordError,
		!!emailError,
		!!usernameError,
		!!nameError,
		!!statusTextError
	].filter(Boolean);

	useEffect(() => {
		onSaveStateChange(canSave);
	}, [canSave, onSaveStateChange]);

	const handleSubmit = useCallback(e => {
		e.preventDefault();
	}, []);

	return (
		<FieldGroup
			is="form"
			pbs="x24"
			autoComplete="off"
			onSubmit={handleSubmit}
			{...props}
		>
			{useMemo(
				() => (
					<Field>
						<UserAvatarEditor
							etag={user.avatarETag}
							currentUsername={user.username}
							username={username}
							setAvatarObj={handleAvatar}
							disabled={!allowUserAvatarChange}
							suggestions={avatarSuggestions}
						/>
					</Field>
				),
				[
					username,
					user.username,
					handleAvatar,
					allowUserAvatarChange,
					avatarSuggestions,
					user.avatarETag
				]
			)}

			
			
			{useMemo(
					() => (
						<Field>
							<Field.Label>{t('Name')}</Field.Label>
							<Field.Row>
								<TextInput
									error={nameError}
									disabled={!allowRealNameChange}
									flexGrow={1}
									value={realname}
									onChange={handleRealname}
								/>
							</Field.Row>
							<Field.Error>{nameError}</Field.Error>
						</Field>
					),
					[
						t,
						realname,
						handleRealname,
						allowRealNameChange,
						nameError
					]
				)}

				{useMemo(
					() => (
						<Field>
							<Field.Label>
								{t('Username')}
							</Field.Label>
							<Field.Row>
								<TextInput
									error={usernameError}
									disabled={!canChangeUsername}
									flexGrow={1}
									value={username}
									onChange={handleUsername}
									addon={<Icon name="at" size="x20" />}
								/>
							</Field.Row>
							<Field.Error>{usernameError}</Field.Error>
						</Field>
					),
					[
						t,
						username,
						handleUsername,
						canChangeUsername,
						usernameError
					]
				)}

				{useMemo(
					() => (
						<Field>
							<Field.Label>{t('Email')}</Field.Label>
							<Field.Row>
								<TextInput
									flexGrow={1}
									value={email}
									error={emailError}
									onChange={handleEmail}
									addon={
										<Icon
											name={
												verified
													? 'circle-check'
													: 'mail'
											}
											size="x20"
										/>
									}
									disabled={!allowEmailChange}
								/>
							</Field.Row>
							<Field.Error>
								{t(emailError)}
							</Field.Error>
						</Field>
					),
					[
						t,
						email,
						handleEmail,
						verified,
						allowEmailChange,
						emailError
					]
				)}

		</FieldGroup>
	);
}

export default AccountProfileForm;
