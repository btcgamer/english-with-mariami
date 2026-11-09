import { paidCourseHandler } from '../_shared/paid-course.mjs';
Deno.serve(paidCourseHandler({env:Deno.env.toObject()}));
