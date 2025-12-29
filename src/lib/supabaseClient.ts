import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qrbttrqhdxmakiwebnpd.supabase.co';
const supabaseKey = 'sb_publishable_YUOGSdH1b8q8QqfjVIvP0g_iMJ5yzqi';
export const supabase = createClient(supabaseUrl, supabaseKey);
