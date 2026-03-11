const { authenticate } = require('@google-cloud/local-auth');
const fs = require('fs').promises;

async function runAuth() {
    console.log('Opening browser to authenticate with Google Cloud...');

    // We are requesting permission for Compute Engine
    const client = await authenticate({
        scopes: ['https://www.googleapis.com/auth/compute', 'https://www.googleapis.com/auth/cloud-platform'],
        keyfilePath: null, // Will trigger user OAuth flow
    });

    const credentials = {
        type: 'authorized_user',
        client_id: client._clientId,
        client_secret: client._clientSecret,
        refresh_token: client.credentials.refresh_token,
    };

    const path = require('path');
    const outPath = path.join(__dirname, 'gcp-key.json');
    await fs.writeFile(outPath, JSON.stringify(credentials, null, 2));

    console.log(`\n✅ SUCCESS!`);
    console.log(`Credentials saved directly to: ${outPath}`);
    console.log(`The OpenClaw backend can now use these to spin up real VMs.`);
}

runAuth().catch(console.error);
