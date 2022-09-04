import { callbacks } from '../../../callbacks/client';
import { trackEvent } from '../trackEvents';
import questionsAndAnswersEvents from '../trackCategories/questionsAndAnswersEvents.json';

const addQuestionsAnswersPageTrackEvents = () => {
    questionsAndAnswersEvents.forEach(questionsAndAnswersEvent => {
        const { callbackName, eventName, piwikCode } = questionsAndAnswersEvent;

        callbacks.add(
            callbackName,
            (state: string) => {
                trackEvent('Q&A', eventName, state);
            },
            callbacks.priority.MEDIUM,
            piwikCode
        );
    });
};

export default addQuestionsAnswersPageTrackEvents;
