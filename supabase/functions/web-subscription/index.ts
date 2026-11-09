import { subscriptionHandler } from '../_shared/play.mjs';
import { webCheckoutHandler } from '../_shared/web-billing.mjs';
const env=Deno.env.toObject();
Deno.serve(webCheckoutHandler({env,statusHandler:subscriptionHandler({env})}));
