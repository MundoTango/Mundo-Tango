import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    'Missing Supabase environment variables. ' +
    'Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Replit Secrets.'
  )
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export async function verifyUser(token: string) {
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
  if (error) throw error
  return user
}
