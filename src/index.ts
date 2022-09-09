import { defineHook } from '@directus/extensions-sdk';
import { FileDeletedHook } from './hooks/FileDeletedHook';
import { FileUploadedHook } from './hooks/FileUploadedHook';
import { isRokkaActivated } from './utils/environment';
import { getItemService } from './utils/services';

export default defineHook(({ filter, action }, hookContext) => {
	action('files.upload', async (record, context) => {
		if (!isRokkaActivated(hookContext.logger)) return;

		const filesService = getItemService(hookContext, record, context);
		const hook = new FileUploadedHook(filesService, hookContext.logger);
		await hook.handle(record);
	});

	// Delete rokka image in filter instead of action since the rokka_hash is already deleted in the action
	filter('files.delete', async (payload, record, context) => {
		if (!isRokkaActivated(hookContext.logger) || !Array.isArray(payload)) return;

		const filesService = getItemService(hookContext, record, context);
		const hook = new FileDeletedHook(filesService, hookContext.logger);

		for (let index = 0; index < payload.length; index++) {
			const key = payload[index];
			await hook.handle(key);
		}
		return payload;
	});
});
