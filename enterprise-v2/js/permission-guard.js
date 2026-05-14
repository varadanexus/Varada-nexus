/* Reusable enterprise module permission guard */
(function () {
  const REDIRECT_URL = '/enterprise-v2/index.html';

  function redirectUnauthorized() {
    window.location.replace(REDIRECT_URL);
  }

  async function checkModuleAccess(pageName) {
    try {
      if (!window.supabaseClient) {
        console.error('Supabase client unavailable: window.supabaseClient not found.');
        redirectUnauthorized();
        return false;
      }

      const supabaseClient = window.supabaseClient;

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
      console.error('Permission guard error:', _err);
      redirectUnauthorized();
      return false;
    }
  }

  window.checkModuleAccess = checkModuleAccess;
})();
