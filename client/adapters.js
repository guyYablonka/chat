import { createTemplateForComponent } from './reactAdapters';

createTemplateForComponent('MessageActions', () =>
	import('./components/Message/Actions')
);

createTemplateForComponent('sidebarFooter', () =>
	import('../app/ui-sidenav/client/SidebarFooter')
);

createTemplateForComponent('reactAttachments', () =>
	import('./components/Message/Attachments')
);
createTemplateForComponent('ThreadMetric', () =>
	import('./components/Message/Metrics/Thread')
);
createTemplateForComponent('DiscussionMetric', () =>
	import('./components/Message/Metrics/Discussion')
);
createTemplateForComponent('BroadCastMetric', () =>
	import('./components/Message/Metrics/Broadcast')
);
