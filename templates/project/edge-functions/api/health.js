import { getHealthResponse } from '../_lib/handlers.js';

export const onRequestGet = (context) => getHealthResponse({ storage: context.env?.inkling_kv });
