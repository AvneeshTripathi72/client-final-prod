import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
    const superAdminId = process.env.NEXT_PUBLIC_SUPER_ADMIN_ID;

    // 0. Transfer ownership of any uploaded profiles to Super Admin
    if (superAdminId && superAdminId !== userId) {
      await supabaseAdmin
        .from('artists')
        .update({ created_by: superAdminId })
        .eq('created_by', userId);
    }

    // 1. Delete from profiles table first (to prevent foreign key constraint violations)
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    // 2. Delete from auth.users
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (authError && authError.message !== 'User not found') {
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'User deleted successfully from both Auth and Database' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
