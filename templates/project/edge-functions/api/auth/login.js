import { postLogin } from '../auth.js';

export const onRequestPost = (context) =>
  postLogin({ request: context.request, storage: context.env?.inkling_kv });
