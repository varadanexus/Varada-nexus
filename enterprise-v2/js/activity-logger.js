/* Reusable enterprise activity logger */
(function () {
  async function logActivity(actionType, moduleName, pageName, description, metadata = {}) {
    try {
      if (!window.supabaseClient) {
        console.error('Supabase client unavailable: window.supabaseClient not found.');
        return false;
      }

      const supabaseClient = window.supabaseClient;

      const { data: sessionData, error: sessionErr } = await supabaseClient.auth.getSession();
      if (sessionErr || !sessionData?.session?.user?.id) {
        return false;
      }

      const authId = sessionData.session.user.id;

      const { data: internalUser, error: userErr } = await supabaseClient
        .from('users')
        .select('id')
        .eq('auth_id', authId)
        .maybeSingle();

      if (userErr || !internalUser?.id) {
        return false;
      }

      const payload = {
        auth_id: authId,
        user_id: internalUser.id,
        action_type: actionType,
        module_name: moduleName,
        page_name: pageName,
        description: description,
        metadata: metadata,
        user_agent: navigator.userAgent
      };

      const { error: insertErr } = await supabaseClient
        .from('activity_logs')
        .insert([payload]);

      if (insertErr) {
        console.error('Activity log insert failed:', insertErr);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Activity logger error:', err);
      return false;
    }
  }

  window.logActivity = logActivity;
})();
