import { API } from '../../api';
import { Meteor } from 'meteor/meteor';

API.helperMethods.set(
	'validateCreateAsUserBodyParams',
	function _validateCreateAsUserBodyParams() {
		check(
			this.bodyParams,
			Match.ObjectIncluding({
				name: String,
				creatorUsername: String,
				members: Match.Optional(Array),
				readOnly: Match.Optional(Boolean)
			})
		);
	}
);
