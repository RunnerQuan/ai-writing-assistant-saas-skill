import { getSiteResponse } from '../_lib/handlers.js';

export const onRequestGet = (context) => getSiteResponse({ storage: context.env?.inkling_kv });
