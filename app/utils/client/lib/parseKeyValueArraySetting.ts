type JsonObject = {
    [key: string]: string;
};

const unwantedStrings = [
    '[{',
    '[\n\t{',
    ':',
    ',',
    '},{',
    '},\n{',
    '}, \n{',
    '}]',
    '}\n]'
];

const isKey = (itemIndex: number) => !(itemIndex % 2);
const isValue = (itemIndex: number) => itemIndex % 2;

export const parseKeyValueArraySetting = (
    stringToFormat: string,
    specialKeyToFormat: string
) => {
    if (!stringToFormat.includes(specialKeyToFormat)) {
        return [];
    }

    const keysValuesAndBetween = stringToFormat.split(specialKeyToFormat);

    const keysAndValues = keysValuesAndBetween.filter(
        item => !unwantedStrings.includes(item.trim())
    );

    const keys = keysAndValues.filter((_, index) => isKey(index));
    const values = keysAndValues.filter((_, index) => isValue(index));

    const items = [];
    let newItem: JsonObject = {};

    keys.forEach((key, valueIndex) => {
        const value = values[valueIndex];

        if (newItem.hasOwnProperty(key)) {
            items.push(newItem);
            newItem = {};
        }
        newItem[key] = value;
    });

    items.push(newItem);

    return items;
};
