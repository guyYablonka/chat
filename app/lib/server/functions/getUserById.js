import { Users } from '../../../models/server';

export const getUserById = (userId, fields) =>
	Users.findOneById(userId, { fields });
