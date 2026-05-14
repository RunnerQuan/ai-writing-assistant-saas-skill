import { postRegister } from '../auth.js';

export const onRequestPost = (context) =>
  postRegister({ request: context.request, storage: context.env?.inkling_kv });
