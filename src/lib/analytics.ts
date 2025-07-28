import { browser } from '$app/environment';
import posthog from 'posthog-js';

export function trackEvent(eventName: string, properties?: Record<string, any>) {
	if (browser && posthog) {
		posthog.capture(eventName, properties);
	}
}

export function identifyUser(userId: string, properties?: Record<string, any>) {
	if (browser && posthog) {
		posthog.identify(userId, properties);
	}
}

export function setUserProperties(properties: Record<string, any>) {
	if (browser && posthog) {
		posthog.people.set(properties);
	}
}