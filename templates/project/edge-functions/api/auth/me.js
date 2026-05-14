import { getMe } from '../auth.js';

export const onRequestGet = (context) =>
  getMe({ request: context.request, storage: context.env?.inkling_kv });
