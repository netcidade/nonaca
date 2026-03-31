import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  // Protect /admin/* except /admin/login
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const session = context.cookies.get('nonaca_admin_session');
    if (!session || session.value !== (import.meta.env.ADMIN_TOKEN || 'nonaca2025')) {
      return context.redirect('/admin/login');
    }
  }

  return next();
});
