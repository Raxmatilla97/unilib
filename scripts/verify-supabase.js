const fs = require('fs');
const path = require('path');
const https = require('https');

try {
    const envPath = path.join(__dirname, '..', '.env.local');
    if (!fs.existsSync(envPath)) {
        console.error('❌ .env.local not found');
        process.exit(1);
    }

    const envContent = fs.readFileSync(envPath, 'utf8');
    const urlMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/);
    const keyMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/);

    if (!urlMatch || !keyMatch) {
        console.error('❌ Keys missing in .env.local');
        process.exit(1);
    }

    const url = urlMatch[1].trim().replace(/["']/g, '');
    const key = keyMatch[1].trim().replace(/["']/g, '');

    console.log('✅ Keys found. Testing connection...');

    const req = https.request(`${url}/rest/v1/books?select=count`, {
        method: 'GET',
        headers: {
            'apikey': key,
            'Authorization': `Bearer ${key}`
        }
    }, (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log('✅ Connection successful!');
        } else {
            console.error(`❌ Connection failed with status: ${res.statusCode}`);
            // Consume response data to free up memory
            res.resume();
        }
    });

    req.on('error', (e) => {
        console.error(`❌ Connection error: ${e.message}`);
    });

    req.end();

} catch (e) {
    console.error('❌ Script error:', e);
}
