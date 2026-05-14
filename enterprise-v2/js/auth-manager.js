/* Centralized enterprise auth manager */
(function () {
  const LOGIN_REDIRECT_URL = '/website/login.html';

  function getClient() {
    if (!window.supabaseClient) {
      console.error('Auth manager: window.supabaseClient is unavailable.');
      return null;
    }
    return window.supabaseClient;
  }

  async function getCurrentSession() {
    try {
      const client = getClient();
      if (!client) return null;

      const { data, error } = await client.auth.getSession();
      if (error) {
        console.error('Auth manager getCurrentSession error:', error);
        return null;
      }

      return data?.session || null;
    } catch (err) {
      console.error('Auth manager getCurrentSession exception:', err);
      return null;
    }
  }

  async function getCurrentUser() {
    try {
      const session = await getCurrentSession();
      return session?.user || null;
    } catch (err) {
      console.error('Auth manager getCurrentUser exception:', err);
      return null;
    }
  }

  async function getInternalUser() {
    try {
      const client = getClient();
      if (!client) return null;

      const user = await getCurrentUser();
      if (!user?.id) return null;

      const { data, error } = await client
        .from('users')
        .select('*')
        .eq('auth_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Auth manager getInternalUser error:', error);
        return null;
      }

      return data || null;
    } catch (err) {
      console.error('Auth manager getInternalUser exception:', err);
      return null;
    }
  }

  async function logoutUser() {
    try {
      const client = getClient();
      if (client) {
        const { error } = await client.auth.signOut();
        if (error) {
          console.error('Auth manager logoutUser signOut error:', error);
        }
      }
    } catch (err) {
      console.error('Auth manager logoutUser exception:', err);
    } finally {
      try {
        sessionStorage.removeItem('manual_logout');
      } catch (storageErr) {
        console.error('Auth manager logoutUser storage cleanup error:', storageErr);
      }
      window.location.replace(LOGIN_REDIRECT_URL);
    }
  }

  window.getCurrentSession = getCurrentSession;
  window.getCurrentUser = getCurrentUser;
  window.getInternalUser = getInternalUser;
  window.logoutUser = logoutUser;
})();
