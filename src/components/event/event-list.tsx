'use client';

import React, { useContext, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useRouter } from 'next/navigation';

import { type Genres } from '@/db/schema/genres';
import { formatDate } from '@/utils/date-time-converter';
import { useEventList } from '@/hooks/event-list';
import {
	type EventsListData,
	type Dates,
	type EventFilterSortColumn,
	type Sort,
	type SortType
} from '@/types/event-data';
import { LogoLoader } from '@/components/logo-loader';
import {
	EasterEggContext,
	EasterEggContextProvider
} from '@/hooks/easter-egg-context';

import {
	EventFilter,
	type EventGenre,
	type EventFilterSchema
} from './event-filter';
import { EventCard } from './event-card';
import { EventSort } from './event-sort';

type EventListProps = {
	initialEvents: EventsListData[];
	genres: Genres[];
	isUserSignedIn: boolean;
};

export const EventList = ({
	initialEvents,
	genres,
	isUserSignedIn
}: EventListProps) => {
	const easterEgg = useContext(EasterEggContext);

	const { eventList, hasMore, loading, fetchData } = useEventList(
		initialEvents,
		50
	);

	const [sort, setSort] = useState<Sort>({ sortType: null, sortColumn: null });
	const [selectedDates, setSelectedDates] = useState<Dates>({
		dateFrom: null,
		dateTo: null
	});

	const [filter, setFilter] = useState<string>('');
	const [selectedGenres, setSelectedGenres] = useState<EventGenre[]>([]);

	const filterData = (
		eventName: string,
		genres: EventGenre[],
		dates: Dates,
		sortColumn: EventFilterSortColumn,
		sortType: SortType
	) => {
		fetchData(true, eventName, genres, dates, sortColumn, sortType, 1);
	};

	const onSubmit = async (values: EventFilterSchema) => {
		if (values.eventName === 'Somebody once?') {
			easterEgg?.toggleEvent();
			return;
		}

		setFilter(values.eventName);
		setSelectedGenres(values.genres ?? []);

		const dates: Dates = {
			dateFrom: values.fromDate ? formatDate(new Date(values.fromDate)) : null,
			dateTo: values.toDate ? formatDate(new Date(values.toDate)) : null
		};

		setSelectedDates(dates);
		filterData(
			values.eventName,
			values.genres ?? [],
			dates,
			sort.sortColumn,
			sort.sortType
		);
	};

	const onEventClick = (eventId: string) => {
		if (!isUserSignedIn) {
			router.push('/signin');
		} else {
			router.push(`/event/${eventId}`);
		}
	};

	const router = useRouter();

	const sortData = (sortColumn: EventFilterSortColumn, direction: SortType) => {
		setSort({
			sortColumn,
			sortType: direction
		});
		filterData(
			filter,
			selectedGenres ?? [],
			selectedDates,
			sortColumn,
			direction
		);
	};

	return (
		<div>
			<EventFilter
				onSubmit={onSubmit}
				genres={genres}
				usersGenres={[]}
				loading={loading}
			/>

			<EventSort
				sortType={sort.sortType}
				sortColumn={sort.sortColumn}
				setSort={setSort}
				sortData={sortData}
				loading={loading}
			/>

			<InfiniteScroll
				dataLength={eventList.length}
				next={async () =>
					await fetchData(
						false,
						filter,
						selectedGenres,
						selectedDates,
						sort.sortColumn,
						sort.sortType
					)
				}
				hasMore={hasMore}
				loader={
					<div className="flex justify-center mt-4">
						<LogoLoader />
					</div>
				}
			>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
					{eventList.map(event => (
						<EventCard
							event={event}
							onClick={onEventClick}
							key={event.eventId}
						/>
					))}
				</div>
			</InfiniteScroll>

			{easterEgg?.isOn ? (
				<iframe
					title="e"
					src="/static/song.mp3"
					allow="autoplay"
					style={{ display: 'none' }}
					id="iframeAudio"
				/>
			) : (
				<div />
			)}
		</div>
	);
};

export const EventListWithContext = ({
	initialEvents,
	genres,
	isUserSignedIn
}: EventListProps) => (
	<EasterEggContextProvider>
		<EventList
			initialEvents={initialEvents}
			genres={genres}
			isUserSignedIn={isUserSignedIn}
		/>
	</EasterEggContextProvider>
);
