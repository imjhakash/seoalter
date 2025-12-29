import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';

  // The user mentioned table "Leads", but there might be casing issues.
  // Supabase API requires exact table name match.
  // Based on errors, "Leads", "leads", "Leads1" were not found publically.
  // However, we MUST use what the user asked for. 
  // If the key provided handles it, it might work.
  // If not, we return the error from Supabase.

  // We will try "Realstate -1" as user specified.
  // Allow overriding table name for debugging: ?q=...&table=leads_1
  const tParam = searchParams.get('table');
  const tableName = tParam || "Realstate -1";

  try {
    let query = supabase
      .from(tableName)
      .select(`
                email, 
                firstname, 
                lastname, 
                "Address1", 
                "Address2", 
                city, 
                state, 
                postal_code, 
                "CompanyName", 
                language_desc
            `);

    if (q) {
      query = query.or(`email.ilike.%${q}%,firstname.ilike.%${q}%,lastname.ilike.%${q}%,CompanyName.ilike.%${q}%,city.ilike.%${q}%,"Address1".ilike.%${q}%`);
    }

    const { data, error, count } = await query.limit(q ? 50 : 20);

    if (error) {
      console.error('Supabase Leads search error:', error);

      if (error.code === 'PGRST205') {
        return NextResponse.json(
          {
            error: 'Table Not Found / Permission Denied',
            details: 'Supabase table "Realstate -1" not found or access denied. Please run the SQL in SUPABASE_INSTRUCTIONS.sql in your Supabase Dashboard.',
            code: 'PGRST205'
          },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to fetch leads from Supabase', details: error.message, code: error.code },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: data,
      count: data?.length || 0
    });

  } catch (error: any) {
    console.error('Unexpected Leads search error:', error);
    return NextResponse.json(
      { error: 'Unexpected error', details: error.message },
      { status: 500 }
    );
  }
}
