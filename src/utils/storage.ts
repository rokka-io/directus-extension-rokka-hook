import DriverLocal from '@directus/storage-driver-local';

export function getStorage(): DriverLocal {
	return new DriverLocal({ root: process.env.STORAGE_LOCAL_ROOT || '' });
}
