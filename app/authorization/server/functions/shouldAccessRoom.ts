import { Promise } from 'meteor/promise';

import { Authorization } from '../../../../server/sdk';
import { IAuthorization } from '../../../../server/sdk/types/IAuthorization';

export const shouldAccessRoomAsync = Authorization.shouldAccessRoom;

export const shouldAccessRoom = (...args: Parameters<IAuthorization['shouldAccessRoom']>): boolean => Promise.await(shouldAccessRoomAsync(...args));
