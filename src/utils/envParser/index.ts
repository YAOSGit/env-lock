import type { EnvMap } from '../../types/EnvSchema/index.js';

export function parseEnv(content: string): EnvMap {
	const result: EnvMap = {};

	for (const line of content.split('\n')) {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith('#')) continue;

		const eqIndex = trimmed.indexOf('=');
		if (eqIndex === -1) continue;

		const key = trimmed.slice(0, eqIndex).trim();
		let value = trimmed.slice(eqIndex + 1).trim();

		if (value.startsWith('"') && value.endsWith('"')) {
			value = value.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
		} else if (value.startsWith("'") && value.endsWith("'")) {
			value = value.slice(1, -1);
		}

		result[key] = value;
	}

	return result;
}

export function serializeEnv(env: EnvMap): string {
	return Object.entries(env)
		.map(([key, value]) => {
			const needsQuotes = /[\s"']/.test(value);
			const escaped = value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
			return needsQuotes ? `${key}="${escaped}"` : `${key}=${value}`;
		})
		.join('\n');
}
