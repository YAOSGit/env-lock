const env = process.env.NODE_ENV || 'unknown';
const port = process.env.PORT || '3000';

console.log(`Starting app in ${env} mode on port ${port}\n`);

const secrets = ['API_KEY', 'DATABASE_URL', 'LOG_LEVEL'];

for (const key of secrets) {
	const value = process.env[key];
	if (value) {
		const masked = value.length > 6 ? `${value.slice(0, 4)}****` : value;
		console.log(`  ${key} = ${masked}`);
	} else {
		console.log(`  ${key} = (not set)`);
	}
}

console.log(`\nLog level: ${process.env.LOG_LEVEL}`);
