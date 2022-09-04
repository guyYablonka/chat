import React from 'react';

import QuestionRoundedIcon from '../../../client/icons/QuestionRoundedIcon';

const QuestionsAndAnswersButton = (props: { text: string }) => {
    return (
        <a
            id='questions-answers-button'
            href='/questions-answers-page'
            style={{
                textAlign: 'end',
                color: 'white',
                display: 'inline-flex',
                height: '32px'
            }}
        >
            <QuestionRoundedIcon
                className='rc-input__icon-svg rc-input__icon-svg--question'
                aria-hidden='true'
                viewBox='0 0 226 226'
            />
            <span
                style={{
                    display: 'inline-block',
                    width: '40px',
                    fontSize: '12px'
                }}
            >
                {props.text}
            </span>
        </a>
    );
};

export default QuestionsAndAnswersButton;
