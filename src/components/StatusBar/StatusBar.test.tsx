import { Text } from 'ink';
import { render } from 'ink-testing-library';
import { describe, expect, it } from 'vitest';
import { StatusBar } from './index.js';

describe('StatusBar', () => {
	it('renders children content', () => {
		const { lastFrame } = render(
			<StatusBar>
				<Text>env-lock | 3 secrets</Text>
			</StatusBar>,
		);
		expect(lastFrame()).toContain('env-lock');
		expect(lastFrame()).toContain('3 secrets');
	});
});
