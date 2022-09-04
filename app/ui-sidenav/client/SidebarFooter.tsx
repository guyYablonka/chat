import React, { ReactElement } from 'react';
import { Box } from '@rocket.chat/fuselage';
import ReactDOMServer from 'react-dom/server';

import { useSetting } from '../../../client/contexts/SettingsContext';
import QuestionsAndAnswersButton from './QuestionsAndAnswersButton';
import { useTranslation } from '../../../client/contexts/TranslationContext';

const SidebarFooter = () => {
    const t = useTranslation();

    const footerFromSettings = useSetting('Layout_Sidenav_Footer');

    const getReactComponentAsString = (component: ReactElement) =>
        ReactDOMServer.renderToString(component);

    const getFooterInnerHTML = () => {
        const qAndAButtonAsString = getReactComponentAsString(
            <QuestionsAndAnswersButton text={t('Common_questions')} />
        );
        return qAndAButtonAsString + String(footerFromSettings).trim();
    };

    return (
        <Box
            is='footer'
            className='sidebar__footer'
            dangerouslySetInnerHTML={{
                __html: getFooterInnerHTML()
            }}
        />
    );
};

export default SidebarFooter;
