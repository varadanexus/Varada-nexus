/* Reusable enterprise module permission guard */
(function () {
  const SUPABASE_URL = 'https://ticsgbtxfhhihamejiss.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpY3NnYnR4ZmhoaWhhbWVqaXNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MjE5MjksImV4cCI6MjA4ODk5NzkyOX0.rWgLPUMNnHIouP4ANQYfmzr3jAopfd3AFouoAMhSkmg';
  const REDIRECT_URL = '/enterprise-v2/index.html';

  function redirectUnauthorized() {
    window.location.replace(REDIRECT_URL);
  }

  async function checkModuleAccess(pageName) {
    try {
      if (!window.supabase || !window.supabase.createClient) {
        redirectUnauthorized();
        return false;
      }

      const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

      const { data: sessionData, error: sessionErr } = await supabaseClient.auth.getSession();
      const session = sessionData?.session;
      if (sessionErr || !session) {
        redirectUnauthorized();
        return false;
      }

      const { data: internalUser, error: userErr } = await supabaseClient
        .from('users')
        .select('id')
        .eq('auth_id', session.user.id)
        .maybeSingle();

      if (userErr || !internalUser?.id) {
        redirectUnauthorized();
        return false;
      }

      const { data: userRoles, error: rolesErr } = await supabaseClient
        .from('user_roles')
        .select('role_id')
        .eq('user_id', internalUser.id);

      if (rolesErr || !userRoles?.length) {
        redirectUnauthorized();
        return false;
      }

      const roleIds = userRoles.map((r) => r.role_id);

      const { data: permissions, error: permErr } = await supabaseClient
        .from('role_permissions')
        .select('id')
        .in('role_id', roleIds)
        .eq('page_name', pageName)
        .eq('action_name', 'view')
        .eq('can_access', true)
        .limit(1);

      const authorized = !permErr && Array.isArray(permissions) && permissions.length > 0;

      if (!authorized) {
        redirectUnauthorized();
        return false;
      }

      return true;
    } catch (_err) {
      redirectUnauthorized();
      return false;
    }
  }

  window.checkModuleAccess = checkModuleAccess;
})();
