import { Logger } from 'pino';
import { RokkaClient } from '../clients/rokka-client';
import { ROKKA_HASH_COLUMN_NAME } from '../utils/config';

export class FileDeletedHook {
	private rokkaClient: RokkaClient;

	constructor(private fileService: any, private logger: Logger) {
		this.rokkaClient = new RokkaClient(logger);
	}

	public async handle(key: string) {
		const rokkaHashToDelete = await this.getHashToDelete(key);

		if (!rokkaHashToDelete) return;

		// If there are other files with the same hash -> do not delete on rokka
		if (await this.hasFilesWithSameRokkaHash(rokkaHashToDelete)) {
			this.logger.info('Skipping deletion of image on Rokka as there are other files with the same hash.');
			return;
		}

		this.logger.info('This file is the only once linked to Rokka. Deleting on Rokka.');
		try {
			await this.rokkaClient.delete(rokkaHashToDelete);
		} catch (e: any) {
			if (e.body?.error?.code === 404) {
				this.logger.error(e.body.error.message);
			} else {
				this.logger.error(`error deleting image with hash ${rokkaHashToDelete}`, e);
			}
		}
	}

	private async getHashToDelete(key: string) {
		const file = await this.fileService.readOne(key);

		return file && file[ROKKA_HASH_COLUMN_NAME] ? file[ROKKA_HASH_COLUMN_NAME] : null;
	}

	private async hasFilesWithSameRokkaHash(rokkaHash: string) {
		const filesWithSameRokkaHash = await this.fileService.readByQuery({
			filter: {
				[ROKKA_HASH_COLUMN_NAME]: {
					_eq: rokkaHash,
				},
			},
			aggregate: {
				count: ['*'],
			},
		});

		return filesWithSameRokkaHash[0]?.count > 1;
	}
}
