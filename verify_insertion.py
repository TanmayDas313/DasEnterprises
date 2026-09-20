import urllib.request
import json
import time

url = 'https://yjrotaknihkyocktfnrm.supabase.co/rest/v1/customer_enquiries'
key = 'sb_publishable_VcfrBYREl_2iV1pb9iZGsw_DUUkkg9R'

headers = {
    'apikey': key,
    'Authorization': f'Bearer {key}',
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
}

data = {
    'name': 'Janardan Das Test Verification',
    'business_name': 'DAS ENTERPRISE',
    'email': 'support.dasent@hotmail.com',
    'phone': '9879005133',
    'industry': 'Services',
    'product': 'TallyPrime Single User',
    'message': 'Automated Supabase database connection verification test for DAS ENTERPRISE website.',
    'source': 'contact'
}

req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers=headers, method='POST')

try:
    with urllib.request.urlopen(req) as resp:
        print('HTTP STATUS:', resp.status)
        print('SUCCESS: Database insertion verified!')
        print('INSERTED RECORD:', resp.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print('HTTP ERROR CODE:', e.code)
    print('RESPONSE DETAILS:', e.read().decode('utf-8'))
except Exception as e:
    print('ERROR:', str(e))
