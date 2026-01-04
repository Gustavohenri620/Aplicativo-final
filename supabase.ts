
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://redwpbvbchzpzbivszup.supabase.co';
const supabaseAnonKey = 'sb_publishable_2VN8pxS0EvCJgnMoXyDftw_X7FiPkIG';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
