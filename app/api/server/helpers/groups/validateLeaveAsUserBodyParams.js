import { API } from '../../api';
import { Meteor } from 'meteor/meteor';

API.helperMethods.set(
	'validateLeaveAsUserBodyParams',
	function _validateLeaveAsUserBodyParams() {
		check(
			this.bodyParams,
			Match.ObjectIncluding({
				roomId: Match.Optional(String),
				roomName: Match.Optional(String),
				leaver: String,
				readOnly: Match.Optional(Boolean)
			})
		);

		this.validateOneFromSomeBodyParamsInclude(['roomId', 'roomName']);
	}
);
