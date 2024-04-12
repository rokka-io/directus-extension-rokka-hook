import DriverLocal from '@directus/storage-driver-local';
import { RokkaException } from "../exceptions";

export function getStorage(): DriverLocal {
	if (!process.env.STORAGE_LOCAL_ROOT) {
		throw new RokkaException(
			`STORAGE_LOCAL_ROOT env variable not defined on server!`,
			500,
			'ENV_VARIABLE_MISSING'
		);
	}
	return new DriverLocal({ root: process.env.STORAGE_LOCAL_ROOT });
}
