import { Template } from 'meteor/templating';

import { settings } from '../../../../settings';

Template.home.helpers({
	title() {
		return settings.get('Layout_Home_Title');
	},
	body() {
		return settings.get('Layout_Home_Body');
	},
	supportGroupLink(){
		return settings.get('Layout_Home_Support_Group_Link');
	},
	landLineNumber(){
		return settings.get('Dev_team_phone_number_For_Home_Page');
	}
});
