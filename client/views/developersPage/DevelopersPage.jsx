import React from 'react';
import { useTranslation } from '../../contexts/TranslationContext';
import { useSetting } from '../../contexts/SettingsContext';
import { useRoute } from '../../contexts/RouterContext';
import { Accordion, Field, Box } from '@rocket.chat/fuselage';
import Page from '../../components/Page';
import { formatBodyString } from './utils';

const DevelopersPage = () => {
    const t = useTranslation();
    const pageContent = useSetting('Layout_Developer_Page');
    const keyToFormat = useSetting('Special_Key_Json_Array_Page_Content');

    const formattedPageContent = pageContent
        ? JSON.parse(formatBodyString(pageContent, keyToFormat))
        : [];

    return (
        <Page>
            <Page.Header title={t('Developers_Page')} />
            {formattedPageContent?.length ? (
                <Page.ScrollableContentWithShadow>
                    <Box maxWidth='x700' w='full' alignSelf='center'>
                        <Accordion>
                            {formattedPageContent.map(contentItem => (
                                <Accordion.Item
                                    key={contentItem.title}
                                    title={t(contentItem.title)}
                                >
                                    <Field
                                        dangerouslySetInnerHTML={{
                                            __html: contentItem.content
                                        }}
                                    />
                                </Accordion.Item>
                            ))}
                        </Accordion>
                    </Box>
                </Page.ScrollableContentWithShadow>
            ) : (
                <div className='rc-dp-parag'>{t('Something_Went_Wrong')}</div>
            )}
        </Page>
    );
};

export default DevelopersPage;
