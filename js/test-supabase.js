/* 
  DAS ENTERPRISE — Supabase Live Connection & Insertion Test Tool
  Run this test to verify database insertion into customer_enquiries table.
*/

async function testSupabaseConnection() {
  const config = window.SUPABASE_CONFIG;
  if (!config || !config.url || !config.anonKey || config.url === 'YOUR_SUPABASE_PROJECT_URL') {
    console.error('FAIL: Supabase credentials not found in js/supabase-config.js');
    return { success: false, message: 'Please update js/supabase-config.js with your Supabase Project URL and Public Anon Key.' };
  }

  try {
    const supabase = window.supabase.createClient(config.url, config.anonKey);
    const testPayload = {
      name: 'Test Visitor',
      business_name: 'Verification Corp',
      email: 'test@dasenterprise-verify.com',
      phone: '9879005133',
      industry: 'Services',
      product: 'TallyPrime Test',
      message: 'Automated verification test entry for Supabase connection.',
      source: 'contact'
    };

    console.log('Sending test insertion to Supabase...');
    const { data, error } = await supabase.from('customer_enquiries').insert([testPayload]);

    if (error) {
      console.error('Supabase Insertion Error:', error);
      return { success: false, message: `Database error: ${error.message}` };
    }

    console.log('SUCCESS: Test enquiry successfully inserted into customer_enquiries table!');
    return { success: true, message: 'Enquiry successfully verified and stored in Supabase customer_enquiries table!' };
  } catch (err) {
    console.error('Test Exception:', err);
    return { success: false, message: `Unexpected error: ${err.message}` };
  }
}

window.testSupabaseConnection = testSupabaseConnection;
