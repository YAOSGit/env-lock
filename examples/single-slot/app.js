const secrets = ['APP_NAME', 'API_KEY', 'DATABASE_URL'];

console.log('Secrets injected into this process:\n');

for (const key of secrets) {
	const value = process.env[key];
	if (value) {
		const masked = `${value.slice(0, 4)}****`;
		console.log(`  ${key} = ${masked}`);
	} else {
		console.log(`  ${key} = (not set)`);
	}
}
