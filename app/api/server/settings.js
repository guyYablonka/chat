import { settings } from '../../settings';

settings.addGroup('General', function () {
	this.section('REST API', function () {
		this.add(
			'API_External_Chat_User_Roles',
			'["aman-user", "masoah-user"]',
			{
				type: 'code',
				public: true,
				i18nDescription: 'API_External_Chat_User_Roles_Description'
			}
		);
		this.add(
			'API_External_Chat_Proxy_Roles',
			'["aman-proxy", "masoah-proxy"]',
			{
				type: 'code',
				public: true,
				i18nDescription: 'API_External_Chat_Proxy_Roles_Description'
			}
		);
		this.add('API_Upper_Count_Limit', 100, { type: 'int', public: false });
		this.add('API_Default_Count', 50, { type: 'int', public: false });
		this.add('API_Allow_Infinite_Count', true, {
			type: 'boolean',
			public: false
		});
		this.add('API_Enable_Direct_Message_History_EndPoint', false, {
			type: 'boolean',
			public: false
		});
		this.add('API_Enable_Shields', true, {
			type: 'boolean',
			public: false
		});
		this.add('API_Shield_Types', '*', {
			type: 'string',
			public: false,
			enableQuery: { _id: 'API_Enable_Shields', value: true }
		});
		this.add('API_Shield_user_require_auth', false, {
			type: 'boolean',
			public: false,
			enableQuery: { _id: 'API_Enable_Shields', value: true }
		});
		this.add('API_Enable_CORS', false, { type: 'boolean', public: false });
		this.add('API_CORS_Origin', '*', {
			type: 'string',
			public: false,
			enableQuery: { _id: 'API_Enable_CORS', value: true }
		});

		this.add('API_Use_REST_For_DDP_Calls', true, {
			type: 'boolean',
			public: true
		});

		this.add(
			'API_Exclude_Calls_Only_On_Websocket',
			"['setUserStatus', 'logout', 'login']",
			{
				type: 'code',
				public: true,
				i18nDescription:
					'API_Exclude_Calls_Only_On_Websocket_Description'
			}
		);
	});
});
