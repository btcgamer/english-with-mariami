import { subscriptionHandler } from '../_shared/play.mjs';
Deno.serve(subscriptionHandler({ env: Deno.env.toObject() }));
