export type KdfAlgorithm = 'argon2id' | 'pbkdf2';

export type Slot = {
	/** Unique slot identifier (e.g. email or label) */
	id: string;
	/** KDF algorithm used to derive the wrapping key */
	kdf: KdfAlgorithm;
	/** Base64-encoded salt for the KDF */
	salt: string;
	/** Number of KDF iterations (PBKDF2) or memory/time params (Argon2id) */
	iterations: number;
	/** Base64-encoded Master Key encrypted with the derived wrapping key */
	wrappedKey: string;
	/** Base64-encoded IV/nonce used for the wrapping encryption */
	wrappingIv: string;
	/** Base64-encoded auth tag from AES-256-GCM wrapping */
	wrappingTag: string;
	/** ISO 8601 timestamp of slot creation */
	createdAt: string;
};
