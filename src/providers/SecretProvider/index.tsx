import type React from 'react';
import {
	createContext,
	useCallback,
	useContext,
	useRef,
	useState,
} from 'react';
import { aesDecrypt, aesEncrypt } from '../../crypto/aes/index.js';
import { unwrapSlot } from '../../crypto/slot/index.js';
import type { EnvMap } from '../../types/EnvSchema/index.js';
import { loadEnvelope, saveEnvelope } from '../../utils/envelope/index.js';
import { parseEnv, serializeEnv } from '../../utils/envParser/index.js';
import { useLockbox } from '../LockboxProvider/index.js';
import type {
	SecretContextValue,
	SecretProviderProps,
} from './SecretProvider.types.js';

const SecretContext = createContext<SecretContextValue | null>(null);

export const SecretProvider: React.FC<SecretProviderProps> = ({ children }) => {
	const { lockbox } = useLockbox();
	const [secrets, setSecrets] = useState<EnvMap>({});
	const [isDirty, setIsDirty] = useState(false);
	const mkRef = useRef<Buffer | null>(null);

	const unlock = useCallback(
		(password: string): boolean => {
			if (!lockbox) return false;

			for (const slot of lockbox.slots) {
				try {
					const mk = unwrapSlot(slot, password);
					mkRef.current = mk;

					const envelope = loadEnvelope();
					if (envelope) {
						const plaintext = aesDecrypt(envelope, mk);
						setSecrets(parseEnv(plaintext));
					}

					return true;
				} catch {}
			}
			return false;
		},
		[lockbox],
	);

	const setSecret = useCallback((key: string, value: string) => {
		setSecrets((prev) => ({ ...prev, [key]: value }));
		setIsDirty(true);
	}, []);

	const addSecret = useCallback((key: string, value: string) => {
		setSecrets((prev) => ({ ...prev, [key]: value }));
		setIsDirty(true);
	}, []);

	const deleteSecret = useCallback((key: string) => {
		setSecrets((prev) => {
			const { [key]: _, ...rest } = prev;
			return rest;
		});
		setIsDirty(true);
	}, []);

	const save = useCallback(() => {
		if (!mkRef.current) return;
		const content = serializeEnv(secrets);
		const envelope = aesEncrypt(content, mkRef.current);
		saveEnvelope(envelope);
		setIsDirty(false);
	}, [secrets]);

	return (
		<SecretContext.Provider
			value={{
				secrets,
				isDirty,
				isUnlocked: mkRef.current !== null,
				masterKey: mkRef.current,
				unlock,
				setSecret,
				addSecret,
				deleteSecret,
				save,
			}}
		>
			{children}
		</SecretContext.Provider>
	);
};

export const useSecrets = (): SecretContextValue => {
	const context = useContext(SecretContext);
	if (!context) {
		throw new Error('useSecrets must be used within a SecretProvider');
	}
	return context;
};
