import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const env = (context.locals as any).runtime?.env ?? {};
    const ADMIN_TOKEN = env.ADMIN_TOKEN ?? import.meta.env.ADMIN_TOKEN ?? 'nonaca2025';
    const session = context.cookies.get('nonaca_admin_session');
    if (!session || session.value !== ADMIN_TOKEN) {
      return context.redirect('/admin/login');
    }
  }

  return next();
});