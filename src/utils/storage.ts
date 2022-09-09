import { Storage, StorageManager, StorageManagerDiskConfig } from '@directus/drive';

export function getStorageManager(storage: string): StorageManager {
	const storageConfig: StorageManagerDiskConfig = {
		local: {
			driver: storage,
			config: {
				root: process.env.STORAGE_LOCAL_ROOT,
			},
		},
	};
	return new StorageManager({
		default: storage,
		disks: storageConfig,
	});
}

export function getStorage(storage: string): Storage {
	return getStorageManager(storage).disk(storage);
}
