import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iecquavtqppytuolinuu.supabase.co';
const supabaseAnonKey = 'sb_publishable_VQHREj8vkiAGzMfqPcSh6w_6MW0EQko';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
