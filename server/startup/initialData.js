import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import _ from 'underscore';

import { RocketChatFile } from '../../app/file';
import { FileUpload } from '../../app/file-upload';
import { addUserRoles, getUsersInRole } from '../../app/authorization';
import { Users, Settings, Rooms } from '../../app/models';
import { settings } from '../../app/settings';
import {
	checkUsernameAvailability,
	addUserToDefaultChannels
} from '../../app/lib';
