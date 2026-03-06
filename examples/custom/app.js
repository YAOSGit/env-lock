const secrets = [
	'APP_NAME',
	'NODE_ENV',
	'PORT',
	'API_KEY',
	'DATABASE_URL',
	'REDIS_URL',
	'SMTP_HOST',
	'SMTP_USER',
	'SMTP_PASS',
	'ENABLE_LOGGING',
];

console.log(`App: ${process.env.APP_NAME}`);
console.log(`Environment: ${process.env.NODE_ENV}`);
console.log(`Port: ${process.env.PORT}\n`);

console.log('All injected secrets:\n');

for (const key of secrets) {
	const value = process.env[key];
	if (value) {
		const masked = value.length > 6 ? `${value.slice(0, 4)}****` : '****';
		console.log(`  ${key} = ${masked}`);
	} else {
		console.log(`  ${key} = (not set)`);
	}
}
