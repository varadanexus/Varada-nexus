import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

export async function handler(req: Request) {

  const { action, user_id, email, password } = await req.json()

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  )

  try {

    /* RESET PASSWORD */
    if (action === "reset_password") {
      const { error } = await supabaseAdmin.auth.admin.updateUserById(
        user_id,
        { password }
      )
      if (error) throw error
      return new Response(JSON.stringify({ success: true }))
    }

    /* DISABLE USER */
    if (action === "disable") {
      const { error } = await supabaseAdmin.auth.admin.updateUserById(
        user_id,
        { ban_duration: "876000h" } // 100 years 😄
      )
      if (error) throw error
      return new Response(JSON.stringify({ success: true }))
    }

    /* ENABLE USER */
    if (action === "enable") {
      const { error } = await supabaseAdmin.auth.admin.updateUserById(
        user_id,
        { ban_duration: "none" }
      )
      if (error) throw error
      return new Response(JSON.stringify({ success: true }))
    }

    return new Response(JSON.stringify({ error: "Invalid action" }))

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 400 })
  }
}
