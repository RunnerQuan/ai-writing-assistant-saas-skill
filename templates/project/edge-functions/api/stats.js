import { getStatsResponse } from '../_lib/handlers.js';

export const onRequestGet = (context) => getStatsResponse({ storage: context.env?.inkling_kv });
