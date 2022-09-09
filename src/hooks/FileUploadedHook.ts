import { Logger } from 'pino';
import { RokkaException } from '../exceptions';
import { RokkaClient } from '../clients/rokka-client';
import { getStorage } from '../utils/storage';
import { ROKKA_HASH_COLUMN_NAME } from '../utils/config';

export class FileUploadedHook {
	private rokkaClient: RokkaClient;

	constructor(private fileService: any, logger: Logger) {
		this.rokkaClient = new RokkaClient(logger);
	}

	public async handle(record: any) {
		if (!this.rokkaClient.isSupported(record.payload.type)) return;

		return await this.uploadImage(record);
	}

	private async uploadImage(record: any) {
		const storage = getStorage(record.payload.storage);

		const { exists } = await storage.exists(record.payload.filename_disk);

		if (!exists) {
			throw new RokkaException(
				`Image ${record.payload.filename_disk} does not exist on storage`,
				500,
				'ROKKA_FILE_MISSING'
			);
		}

		const stream = storage.getStream(record.payload.filename_disk);

		const rokkaHash = await this.rokkaClient.upload(record.payload.filename_download, stream);

		await this.storeRokkaHash(record.key, rokkaHash);
	}

	private async storeRokkaHash(key: string, rokkaHash?: string | null) {
		if (!rokkaHash) return;

		return await this.fileService.updateOne(key, {
			[ROKKA_HASH_COLUMN_NAME]: rokkaHash,
		});
	}
}
