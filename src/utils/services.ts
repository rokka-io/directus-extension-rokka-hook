import { EventContext } from '@directus/shared/src/types/events';
import { ApiExtensionContext } from '@directus/shared/src/types/extensions';

// HookExtensionContext is not exported in hooks.ts so we declare it here again
type HookExtensionContext = ApiExtensionContext & {
	emitter: any;
};

export const getItemService = (
	hookContext: HookExtensionContext,
	record: Record<string, any>,
	context: EventContext
) => {
	const { ItemsService } = hookContext.services;
	return new ItemsService(record.collection, {
		schema: context.schema,
		knex: context.database,
		accountability: context.accountability,
	});
};
