import React, { PropsWithChildren, useState } from 'react';
import { Accordion, AccordionItemProps } from '@rocket.chat/fuselage';
import { callbacks } from '../../../../app/callbacks/client';

export const QuestionsAndAnswersItem = ({
    id,
    title,
    children
}: PropsWithChildren<AccordionItemProps>) => {
    const [toggle, setToggle] = useState(false);

    const onToggleItem = () => {
        setToggle(toggle => {
            if (!toggle) {
                callbacks.run('userExpandedQuestionEntry', id);
            }

            return !toggle;
        });
    };

    return (
        <Accordion.Item title={title} expanded={toggle} onToggle={onToggleItem}>
            {children}
        </Accordion.Item>
    );
};
