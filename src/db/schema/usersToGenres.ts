import {
	integer,
	primaryKey,
	sqliteTable,
	text
} from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

import { users } from '@/db/schema/users';
import { genres } from '@/db/schema/genres';

export const usersToGenres = sqliteTable(
	'usersToGenres',
	{
		userId: text('userId')
			.notNull()
			.references(() => users.id),
		genreId: text('genreId')
			.notNull()
			.references(() => genres.id),
		isDeleted: integer('isDeleted', { mode: 'boolean' }).default(false)
	},
	t => ({
		pk: primaryKey({ columns: [t.userId, t.genreId] })
	})
);

export const usersToGenresRelations = relations(usersToGenres, ({ one }) => ({
	genre: one(genres, {
		fields: [usersToGenres.genreId],
		references: [genres.id]
	}),
	user: one(users, {
		fields: [usersToGenres.userId],
		references: [users.id]
	})
}));
