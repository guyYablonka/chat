import {
    useMutableCallback,
    useResizeObserver
} from '@rocket.chat/fuselage-hooks';
import React, {
    useEffect,
    useRef,
    useMemo,
    useState,
    ComponentProps
} from 'react';
import {
    Box,
    Chip,
    InputBox,
    Margins,
    Options,
    Option,
    PositionAnimated,
    AnimatedVisibility,
    useCursor,
    AutoComplete
} from '@rocket.chat/fuselage';
import { useTranslation } from '/client/contexts/TranslationContext';

type AutoCompleteProps = {
    value: readonly string[];
    getValue: (option: {
        label: string;
        value: ComponentProps<typeof AutoComplete>['value'];
    }) => AutoCompleteProps['value'];
} & Omit<ComponentProps<typeof AutoComplete>, 'value' | 'getValue'>;

const getCursorValue = (value: AutoCompleteProps['value']): string | number =>
    Array.isArray(value) ? value[0] : value ?? '';

const SelectedOptions = React.memo(
    ({
        role,
        selectedOptions,
        ...props
    }: {
        role: React.AriaRole;
        selectedOptions: NonNullable<AutoCompleteProps['options']>;
        [x: string]: unknown;
    }) => (
        <>
            {selectedOptions.map(({ value, label }) => (
                <Chip
                    role={role}
                    key={Array.isArray(value) ? value[0] : value ?? label[0]}
                    value={value}
                    label={label}
                    {...props}
                >
                    <Box
                        is='span'
                        margin='none'
                        mis='x4'
                        style={{
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word'
                        }}
                    >
                        {value}
                    </Box>
                </Chip>
            ))}
        </>
    )
);

const RenderEmpty = (_props: unknown) => {
    const t = useTranslation();
    return <Option label={t('Name_Not_Exists')} />;
};

export function AutoCompleteMultiple({
    value,
    filter,
    setFilter = () => null,
    options = [],
    renderItem,
    renderSelected: RenderSelected = SelectedOptions,
    onChange = () => null,
    getValue = ({ value }) => value as readonly string[],
    renderEmpty = RenderEmpty,
    placeholder,
    disabled,
    ...props
}: AutoCompleteProps) {
    const { ref: containerRef, borderBoxSize } = useResizeObserver();

    const ref = useRef<HTMLInputElement>();

    const memoizedOptions: [
        AutoCompleteProps['value'],
        string,
        (boolean | undefined)?
    ][] = useMemo(
        () =>
            options.map(({ label, value }) => [
                value as readonly string[],
                label
            ]),
        [options]
    );

    const [selected, setSelected] = useState(() =>
        value.length ? [options.find(option => getValue(option) === value)] : []
    );

    const onSelect = useMutableCallback(([value]) => {
        if (filter && value) {
            setSelected(selected => [
                ...selected,
                options.find(option => getValue(option) === value)
            ]);
            onChange(value);
            setFilter('');
            hide();
        }
    });

    const [cursor, handleKeyDown, , reset, [optionsAreVisible, hide, show]] =
        useCursor(getCursorValue(value), memoizedOptions, onSelect);

    useEffect(reset, [filter, reset]);

    return (
        <Box
            rcx-autocomplete
            ref={containerRef}
            onClick={useMutableCallback(_ => filter && ref.current?.focus())}
            flexGrow={1}
            className={useMemo(() => (disabled ? 'disabled' : ''), [disabled])}
            {...props}
        >
            <Box
                display='flex'
                flexGrow={1}
                alignItems='center'
                flexWrap='wrap'
                margin='neg-x4'
                role='listbox'
            >
                <Margins all='x4'>
                    <InputBox
                        ref={ref}
                        onChange={useMutableCallback(
                            (e: React.FormEvent<HTMLInputElement>) =>
                                setFilter(e.currentTarget.value)
                        )}
                        onBlur={hide}
                        onFocus={show}
                        onKeyDown={handleKeyDown}
                        placeholder={!filter ? placeholder : ''}
                        order={1}
                        rcx-input-box--undecorated
                        value={filter}
                    />
                    {!!selected.length && value && (
                        <RenderSelected role='option' value={value} />
                    )}
                </Margins>
            </Box>
            <PositionAnimated
                visible={filter ? optionsAreVisible : AnimatedVisibility.HIDDEN}
                anchor={containerRef}
            >
                <Options
                    role='option'
                    width={borderBoxSize.inlineSize}
                    onSelect={onSelect}
                    renderItem={renderItem}
                    renderEmpty={renderEmpty}
                    cursor={cursor}
                    value={value}
                    options={memoizedOptions}
                />
            </PositionAnimated>
        </Box>
    );
}

export default AutoCompleteMultiple;
