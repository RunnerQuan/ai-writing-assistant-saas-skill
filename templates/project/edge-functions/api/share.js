import { postShareResponse } from '../_lib/handlers.js';

export const onRequestPost = ({ request }) => postShareResponse({ request });
