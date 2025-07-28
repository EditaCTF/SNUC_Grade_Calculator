import posthog from 'posthog-js';
import { browser } from '$app/environment';

export const load = async () => {
	if (browser) {
		posthog.init(import.meta.env.VITE_POSTHOG_API_KEY, {
			api_host: 'https://us.i.posthog.com',
			defaults: '2025-05-24',
			person_profiles: 'identified_only'
		});
	}

	return {};
};
