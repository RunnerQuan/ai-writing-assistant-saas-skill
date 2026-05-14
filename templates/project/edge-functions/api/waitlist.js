import { postWaitlistResponse } from '../_lib/handlers.js';

export const onRequestPost = ({ request }) => postWaitlistResponse({ request });
