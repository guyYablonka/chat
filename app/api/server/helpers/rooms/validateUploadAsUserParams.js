import { API } from '../../api';
import { Meteor } from 'meteor/meteor';

API.helperMethods.set(
	'validateUploadAsUserParams',
	function _validateUploadAsUserBodyParams() {
		check(
			this.bodyParams,
			Match.ObjectIncluding({
				fileName: String,
				mimeType: String,
				byUsername: String,
				description: Match.Optional(String),
				msgData: Match.Optional(Object),
				extraData: Match.Optional(Object),
				roomId: Match.Optional(String),
				roomName: Match.Optional(String),
				targetUsername: Match.Optional(String)
			})
		);

		this.validateOneFromSomeBodyParamsInclude([
			'roomId',
			'roomName',
			'targetUsername'
		]);
	}
);
