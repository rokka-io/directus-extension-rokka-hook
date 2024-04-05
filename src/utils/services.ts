import { EventContext } from '@directus/types';

export const getItemService = (hookContext: any, record: Record<string, any>, context: EventContext) => {
	const { ItemsService } = hookContext.services;
	return new ItemsService(record.collection, {
		schema: context.schema,
		knex: context.database,
		accountability: context.accountability,
	});
};
