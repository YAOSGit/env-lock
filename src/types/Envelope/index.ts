export type Envelope = {
	/** AES-256-GCM encrypted payload (base64) */
	ciphertext: string;
	/** Initialization vector / nonce (base64) */
	iv: string;
	/** Authentication tag (base64) */
	tag: string;
};
