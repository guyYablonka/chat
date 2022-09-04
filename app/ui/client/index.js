import { createTemplateForComponent } from '../../../client/reactAdapters';

import './lib/accounts';
import './lib/collections';
import './lib/iframeCommands';
import './lib/menu';
import './lib/parentTemplate';
import './lib/codeMirror';
import './lib/textarea-cursor';
import './views/cmsPage.html';
import './views/404/roomNotFound.html';
import './views/404/invalidSecretURL.html';
import './views/404/invalidInvite.html';
import './views/app/burger.html';
import './views/app/createChannel.html';
import './views/app/editStatus.html';
import './views/app/editStatus.css';
import './views/app/home.html';
import './views/app/notAuthorized.html';
import './views/app/pageContainer.html';
import './views/app/pageCustomContainer.html';
import './views/app/roomSearch.html';
import './views/app/secretURL.html';
import './views/app/userSearch.html';
import './views/app/videoCall/videoButtons.html';
import './views/app/videoCall/videoCall.html';
import './views/app/photoswipe.html';
import './views/cmsPage';
import './views/404/roomNotFound';
import './views/app/burger';
import './views/app/createChannel';
import './views/app/CreateDirectMessage';
import './views/app/editStatus';
import './views/app/home';
import './views/app/roomSearch';
import './views/app/secretURL';
import './views/app/invite';
import './views/app/videoCall/videoButtons';
import './views/app/videoCall/videoCall';
import './views/app/photoswipe';
import './components/status';
import './components/table.html';
import './components/table';
import './components/popupList.html';
import './components/popupList';
import './components/selectDropdown.html';

import './components/header/header';
import './components/tooltip';
import './lib/Tooltip';

export { ChatMessages } from './lib/chatMessages';
export { fileUpload } from './lib/fileUpload';
export { MsgTyping } from './lib/msgTyping';
export { KonchatNotification } from './lib/notification';
export { Login, Button } from './lib/rocket';
export { AudioRecorder } from './lib/recorderjs/audioRecorder';
export { VideoRecorder } from './lib/recorderjs/videoRecorder';
export { chatMessages } from './views/app/room';
export * from './lib/userPopoverStatus';

createTemplateForComponent('RoomForeword', () =>
	import('../../../client/components/RoomForeword')
);