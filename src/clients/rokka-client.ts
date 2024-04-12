import rokka from 'rokka';
import { Logger } from 'pino';
import { RokkaException } from '../exceptions';
import { ResizeMode, StackConfig } from '../types';
import { getRokkaConfiguration, RokkaConfiguration } from '../utils/environment';

const SUPPORTED_IMAGE_TYPES: string[] = [
	'image/jpeg',
	'image/png',
	'image/gif',
	'image/svg+xml',
	'image/tiff',
	'image/bmp',
	'application/pdf',
];

export class RokkaClient {
	rokkaApi;
	rokkaConfiguration: RokkaConfiguration;

	constructor(private logger: Logger) {
		this.rokkaConfiguration = getRokkaConfiguration();

		this.rokkaApi = rokka({
			apiKey: this.rokkaConfiguration.apiKey,
		});
	}

	public isSupported(mimeType: string): boolean {
		return SUPPORTED_IMAGE_TYPES.includes(mimeType) && this.isMimeTypeActivated(mimeType);
	}

	private isMimeTypeActivated(mimeType: string): boolean {
		return this.rokkaConfiguration.activatedMimeTypes
			? this.rokkaConfiguration.activatedMimeTypes.includes(mimeType)
			: true;
	}

	public async uploadByUrl(url: string) {
		const response = await this.rokkaApi.sourceimages.createByUrl(this.rokkaConfiguration.organization, url);
		return response.body.items && response.body.items.length > 0 ? response.body.items[0]?.hash : null;
	}

	public async upload(fileName: string, fileStream: any) {
		const response = await this.rokkaApi.sourceimages.create(
			this.rokkaConfiguration.organization,
			fileName,
			fileStream
		);

		return response.body.items && response.body.items.length > 0 ? response.body.items[0]?.hash : null;
	}

	public async delete(hash: string) {
		const response = await this.rokkaApi.sourceimages.delete(this.rokkaConfiguration.organization, hash);
		if (response.statusCode !== 204 && response.statusCode !== 404) {
			throw new RokkaException(response.message ?? 'UNKNOWN MESSAGE', 500, 'ROKKA_IMAGE_NOT_DELETED');
		}
	}

	public async syncStacks(stackConfigurations: StackConfig[]) {
		const existingStacks = await this.rokkaApi.stacks.list(this.rokkaConfiguration.organization);
		const updatedStacks: string[] = [];
		for (const stackConfig of stackConfigurations) {
			await this.rokkaApi.stacks.create(
				this.rokkaConfiguration.organization,
				stackConfig.stackName,
				{
					operations: this.buildOperations(stackConfig),
					options: { 'optim.quality': stackConfig.quality, autoformat: true },
				},
				{ overwrite: true }
			);
			updatedStacks.push(stackConfig.stackName);
		}

		for (const existingStack of existingStacks.body.items) {
			if (!updatedStacks.includes(existingStack.name)) {
				await this.rokkaApi.stacks.delete(this.rokkaConfiguration.organization, existingStack.name);
			}
		}
	}

	public async deleteAllImages(batchSize: number) {
		let images = await this.rokkaApi.sourceimages.list(this.rokkaConfiguration.organization, {
			limit: batchSize,
		});

		do {
			for (const image of images.body.items) {
				try {
					await this.rokkaApi.sourceimages.delete(this.rokkaConfiguration.organization, image.hash);
					this.logger.info(`deleted image ${image.hash}`);
				} catch (e: any) {
					if (e.body?.error?.code === 404) {
						this.logger.error(`image ${image.hash} was already gone`);
					} else {
						this.logger.error(`error deleting image ${image.hash}`, e);
					}
				}
			}

			images = await this.rokkaApi.sourceimages.list(this.rokkaConfiguration.organization, {
				limit: batchSize,
				cursor: images.body.cursor,
			});
		} while (images.body.items.length === batchSize);
	}

	private buildOperations(stackConfig: StackConfig) {
		const rokkaOperations = [];
		for (const operation of stackConfig.operations) {
			switch (operation) {
				case 'resize':
					rokkaOperations.push(this.rokkaApi.operations.resize(stackConfig.width, stackConfig.height));
					break;
				case 'resize-fill':
					rokkaOperations.push(
						this.rokkaApi.operations.resize(stackConfig.width, stackConfig.height, { mode: ResizeMode.Fill })
					);
					break;
				case 'crop':
					rokkaOperations.push(this.rokkaApi.operations.crop(stackConfig.width, stackConfig.height));
					break;
				case 'crop-box':
					rokkaOperations.push(
						this.rokkaApi.operations.crop(stackConfig.width, stackConfig.height, { mode: ResizeMode.Box })
					);
					break;
			}
		}
		return rokkaOperations;
	}
}
