import { Users } from '../../../models/server';
import { saveCustomFields } from './saveCustomFields';

export const updateUserPhoneNumber = function (userId, newPhoneNumber) {
	Users.update(
		{ 'customFields.phoneNumber': newPhoneNumber },
		{ $unset: { 'customFields.phoneNumber': '' } },
		{ multi: true }
	);

	saveCustomFields(userId, {
		phoneNumber: newPhoneNumber
	});
};
