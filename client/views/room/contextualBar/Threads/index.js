import React, { useCallback, useMemo, useState, useRef, memo } from 'react';
import {
	Box,
	Icon,
	TextInput,
	Select,
	Margins,
	Callout
} from '@rocket.chat/fuselage';
import { FixedSizeList as List } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import {
	useDebouncedValue,
	useResizeObserver,
	useLocalStorage,
	useMutableCallback
} from '@rocket.chat/fuselage-hooks';

import VerticalBar from '../../../../components/VerticalBar';
import { useTranslation } from '../../../../contexts/TranslationContext';
import {
	useRoute,
	useCurrentRoute,
	useQueryStringParameter
} from '../../../../contexts/RouterContext';
import { call } from '../../../../../app/ui-utils/client';
import {
	useUserId,
	useUserSubscription
} from '../../../../contexts/UserContext';
import { useUserRoom } from '../../hooks/useUserRoom';
import { useSetting } from '../../../../contexts/SettingsContext';
import { useTimeAgo } from '../../../../hooks/useTimeAgo';
import { clickableItem } from '../../../../lib/clickableItem';
import { MessageSkeleton } from '../../components/Message';
import ThreadListMessage from './components/Message';
import { escapeHTML } from '../../../../../lib/escapeHTML';
import { AsyncStatePhase } from '../../../../hooks/useAsyncState';
import ScrollableContentWrapper from '../../../../components/ScrollableContentWrapper';
import { useTabBarClose, useTabContext } from '../../providers/ToolboxProvider';
import ThreadComponent from '../../../../../app/threads/client/components/ThreadComponent';
import { renderMessageBody } from '../../../../lib/renderMessageBody';
import { useThreadsList } from './useThreadsList';
import { useRecordList } from '../../../../hooks/lists/useRecordList';

function mapProps(WrappedComponent) {
	return ({ msg, username, replies = [], tcount, ts, ...props }) => (
		<WrappedComponent
			replies={tcount}
			participants={replies?.length}
			username={username}
			msg={msg}
			ts={ts}
			{...props}
		/>
	);
}

const Thread = React.memo(mapProps(clickableItem(ThreadListMessage)));

const Skeleton = React.memo(clickableItem(MessageSkeleton));

const subscriptionFields = { tunread: 1, tunreadUser: 1, tunreadGroup: 1 };
const roomFields = { t: 1, name: 1 };

export function withData(WrappedComponent) {
	return ({ rid, ...props }) => {
		const userId = useUserId();
		const onClose = useTabBarClose();
		const room = useUserRoom(rid, roomFields);
		const subscription = useUserSubscription(rid, subscriptionFields);

		const [type, setType] = useLocalStorage('thread-list-type', 'all');

		const [text, setText] = useState('');
		const debouncedText = useDebouncedValue(text, 400);

		const options = useMemo(
			() => ({
				rid,
				text: debouncedText,
				type,
				tunread: subscription?.tunread,
				uid: userId
			}),
			[rid, debouncedText, type, subscription, userId]
		);

		const { threadsList, initialItemCount, loadMoreItems } = useThreadsList(
			options,
			userId
		);
		const {
			phase,
			error,
			items: threads,
			itemCount: totalItemCount
		} = useRecordList(threadsList);

		const handleTextChange = useCallback(event => {
			setText(event.currentTarget.value);
		}, []);

		return (
			<WrappedComponent
				{...props}
				unread={subscription?.tunread}
				unreadUser={subscription?.tunreadUser}
				unreadGroup={subscription?.tunreadGroup}
				userId={userId}
				error={error}
				threads={threads}
				total={totalItemCount}
				initial={initialItemCount}
				loading={phase === AsyncStatePhase.LOADING}
				loadMoreItems={loadMoreItems}
				room={room}
				text={text}
				setText={handleTextChange}
				type={type}
				setType={setType}
				onClose={onClose}
			/>
		);
	};
}

const handleFollowButton = e => {
	e.preventDefault();
	e.stopPropagation();
	call(
		![true, 'true'].includes(e.currentTarget.dataset.following)
			? 'followMessage'
			: 'unfollowMessage',
		{ mid: e.currentTarget.dataset.id }
	);
};

export const normalizeThreadMessage = ({ ...message }) => {
	if (message.msg) {
		return renderMessageBody(message).replace(/<br\s?\\?>/g, ' ');
	}

	if (message.attachments) {
		const attachment = message.attachments.find(
			attachment => attachment.title || attachment.description
		);

		if (attachment && attachment.description) {
			return escapeHTML(attachment.description);
		}

		if (attachment && attachment.title) {
			return escapeHTML(attachment.title);
		}
	}
};

const Row = memo(function Row({
	data,
	index,
	style,
	showRealNames,
	unread,
	unreadUser,
	unreadGroup,
	userId,
	onClick
}) {
	const t = useTranslation();
	const formatDate = useTimeAgo();

	if (!data[index]) {
		return <Skeleton style={style} />;
	}
	const thread = data[index];
	const msg = normalizeThreadMessage(thread);

	const { name = thread.u.username } = thread.u;

	return (
		<Thread
			{...thread}
			name={showRealNames ? name : thread.u.username}
			username={thread.u.username}
			style={style}
			unread={unread.includes(thread._id)}
			mention={unreadUser.includes(thread._id)}
			all={unreadGroup.includes(thread._id)}
			following={thread.replies && thread.replies.includes(userId)}
			data-id={thread._id}
			msg={msg}
			t={t}
			formatDate={formatDate}
			handleFollowButton={handleFollowButton}
			onClick={onClick}
		/>
	);
});

export function ThreadList({
	total = 10,
	initial = 10,
	threads = [],
	room,
	unread = [],
	unreadUser = [],
	unreadGroup = [],
	type,
	setType,
	loadMoreItems,
	loading,
	onClose,
	error,
	userId,
	text,
	setText
}) {
	const showRealNames = useSetting('UI_Use_Real_Name');
	const threadsRef = useRef();

	const t = useTranslation();

	const [name] = useCurrentRoute();
	const channelRoute = useRoute(name);
	const onClick = useMutableCallback(e => {
		const { id: context } = e.currentTarget.dataset;
		channelRoute.push({
			tab: 'thread',
			context,
			rid: room._id,
			name: room.name
		});
	});

	const options = useMemo(
		() => [
			['all', t('All')],
			['following', t('Following')],
			['unread', t('Unread')]
		],
		[t]
	);

	threadsRef.current = threads;

	const rowRenderer = useCallback(
		({ data, index, style }) => (
			<Row
				data={data}
				index={index}
				style={style}
				showRealNames={showRealNames}
				unread={unread}
				unreadUser={unreadUser}
				unreadGroup={unreadGroup}
				userId={userId}
				onClick={onClick}
			/>
		),
		[showRealNames, unread, unreadUser, unreadGroup, userId, onClick]
	);

	const isItemLoaded = useMutableCallback(
		index => index < threadsRef.current.length
	);
	const {
		ref,
		contentBoxSize: { inlineSize = 378, blockSize = 1 } = {}
	} = useResizeObserver({ debounceDelay: 200 });

	const mid = useTabContext();
	const jump = useQueryStringParameter('jump');

	return (
		<>
			<VerticalBar.Header>
				<VerticalBar.Icon name="thread" />
				<VerticalBar.Text>{t('Threads')}</VerticalBar.Text>
				<VerticalBar.Close onClick={onClose} />
			</VerticalBar.Header>
			<VerticalBar.Content paddingInline={0}>
				<Box
					display="flex"
					flexDirection="row"
					p="x24"
					borderBlockEndWidth="x2"
					borderBlockEndStyle="solid"
					borderBlockEndColor="neutral-200"
					flexShrink={0}
				>
					<Box
						display="flex"
						flexDirection="row"
						flexGrow={1}
						mi="neg-x4"
					>
						<Margins inline="x4">
							<TextInput
								placeholder={t('Search_Messages')}
								value={text}
								onChange={setText}
								addon={<Icon name="magnifier" size="x20" />}
							/>
							<Select
								flexGrow={0}
								width="110px"
								onChange={setType}
								value={type}
								options={options}
							/>
						</Margins>
					</Box>
				</Box>
				<Box
					flexGrow={1}
					flexShrink={1}
					ref={ref}
					overflow="hidden"
					display="flex"
				>
					{error && (
						<Callout mi="x24" type="danger">
							{error.toString()}
						</Callout>
					)}
					{total === 0 && <Box p="x24">{t('No_Threads')}</Box>}
					{!error && total > 0 && (
						<InfiniteLoader
							isItemLoaded={isItemLoaded}
							itemCount={total}
							loadMoreItems={loading ? () => {} : loadMoreItems}
						>
							{({ onItemsRendered, ref }) => (
								<List
									outerElementType={ScrollableContentWrapper}
									height={blockSize}
									width={inlineSize}
									itemCount={total}
									itemData={threads}
									itemSize={124}
									ref={ref}
									minimumBatchSize={initial}
									onItemsRendered={onItemsRendered}
								>
									{rowRenderer}
								</List>
							)}
						</InfiniteLoader>
					)}
				</Box>
			</VerticalBar.Content>
			{mid && (
				<VerticalBar.InnerContent>
					<ThreadComponent mid={mid} jump={jump} room={room} />
				</VerticalBar.InnerContent>
			)}
		</>
	);
}

export default withData(ThreadList);
