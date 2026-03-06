import type { EnvMap } from '../../types/EnvSchema/index.js';

export type SecretListProps = {
	secrets: EnvMap;
	isDirty: boolean;
	onEdit: (key: string, value: string) => void;
	onAdd: (key: string, value: string) => void;
	onDelete: (key: string) => void;
	onSave: () => void;
};

export type Mode =
	| { type: 'browse' }
	| { type: 'editing'; key: string; value: string }
	| { type: 'adding-key'; value: string }
	| { type: 'adding-value'; key: string; value: string }
	| { type: 'confirm-delete'; key: string };
