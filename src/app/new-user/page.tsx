import React from 'react';
import { redirect } from 'next/navigation';

import { UserForm } from '@/components/user-form/user-form';
import { auth } from '@/auth';
import { getAllGenres } from '@/server-actions/genres';

const NewUserPage = async () => {
	const session = await auth();

	// User is already registered on website, redirect to home
	if (!session?.user?.id || session?.user.isRegistrationFinished) {
		redirect('/');
	}

	const genres = await getAllGenres();

	return (
		<UserForm
			userImage={session?.user?.image}
			heading="Welcome to SnapShow"
			genres={genres}
			usersGenres={[]}
			bio={undefined}
			username={undefined}
		/>
	);
};

export default NewUserPage;
