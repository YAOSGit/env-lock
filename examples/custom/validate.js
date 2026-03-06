import { z } from 'zod';

const envSchema = z.object({
	APP_NAME: z.string().min(1),
	NODE_ENV: z.enum(['development', 'staging', 'production']),
	PORT: z.string().regex(/^\d+$/).transform(Number),
	API_KEY: z.string().startsWith('sk_'),
	DATABASE_URL: z.string().url(),
	REDIS_URL: z.string().url(),
	SMTP_HOST: z.string().min(1),
	SMTP_USER: z.string().email(),
	SMTP_PASS: z.string().min(1),
	ENABLE_LOGGING: z
		.string()
		.transform((v) => v === 'true')
		.pipe(z.boolean()),
});

const result = envSchema.safeParse(process.env);

if (result.success) {
	console.log('Environment validation passed.\n');
	console.log('Parsed config:');
	console.log(`  App:     ${result.data.APP_NAME}`);
	console.log(`  Env:     ${result.data.NODE_ENV}`);
	console.log(`  Port:    ${result.data.PORT} (number)`);
	console.log(`  Logging: ${result.data.ENABLE_LOGGING} (boolean)`);
} else {
	console.error('Environment validation failed:\n');
	for (const issue of result.error.issues) {
		console.error(`  ${issue.path.join('.')}: ${issue.message}`);
	}
	process.exit(1);
}
