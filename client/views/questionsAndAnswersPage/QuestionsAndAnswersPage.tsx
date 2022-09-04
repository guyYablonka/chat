import React from 'react';
import { Accordion, Box } from '@rocket.chat/fuselage';
import _ from 'underscore.string';

import { QuestionAndAnswerItem } from './types/QuestionAndAnswerItem';
import { QuestionsAndAnswersItem } from './Item/QuestionsAndAnswersItem';
import { useTranslation } from '../../contexts/TranslationContext';
import { useSetting } from '../../contexts/SettingsContext';
import Page from '../../components/Page';
import { parseKeyValueArraySetting } from '../../../app/utils/client';
import MarkdownText from '../../components/MarkdownText';

const QuestionsAndAnswersPage = () => {
    const t = useTranslation();
    const pageContent = useSetting(
        'Layout_Questions_And_Answers_Page'
    ) as string;
    const specialKeyToFormat = useSetting(
        'Special_Key_Json_Array_Page_Content'
    ) as string;

    const formattedPageContent = pageContent
        ? (parseKeyValueArraySetting(
              pageContent,
              specialKeyToFormat
          ) as Array<QuestionAndAnswerItem>)
        : [];

    return (
        <Page>
            <Page.Header title={t('Questions_And_Answers_Page')} />
            {formattedPageContent?.length ? (
                <Page.ScrollableContentWithShadow>
                    <Box maxWidth='x700' w='full' alignSelf='center'>
                        <Accordion className='qa-item'>
                            {formattedPageContent.map(contentItem => (
                                <QuestionsAndAnswersItem
                                    id={contentItem.key}
                                    key={contentItem.key}
                                    title={contentItem.question}
                                >
                                    <MarkdownText
                                        content={contentItem.answer}
                                    />
                                </QuestionsAndAnswersItem>
                            ))}
                        </Accordion>
                    </Box>
                </Page.ScrollableContentWithShadow>
            ) : (
                <div style={{ marginRight: '15px' }}>
                    {t('Something_Went_Wrong')}
                </div>
            )}
        </Page>
    );
};

export default QuestionsAndAnswersPage;
