import {webHookHandler} from '../_shared/web-hook.mjs';
Deno.serve(webHookHandler({env:Deno.env.toObject()}));
