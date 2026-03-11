const https = require('https');

const checkEndpoint = (port) => {
    return new Promise((resolve) => {
        const reqUrl = `https://34.136.215.118:${port}`;
        const request = https.get(reqUrl, { rejectUnauthorized: false, timeout: 5000 }, (response) => {
            console.log(`Port ${port} responded with status:`, response.statusCode);
            resolve(response.statusCode < 500); 
        });
        request.on('error', (e) => {
            console.log(`Port ${port} error:`, e.code);
            resolve(false);
        });
        request.on('timeout', () => { 
            console.log(`Port ${port} timed out`);
            request.destroy(); 
            resolve(false); 
        });
    });
};

async function test() {
    console.log("Starting debug probe...");
    
    // We expect 200, 302, 401, 404 etc. Anything but connection reset/timeout
    const oc = await checkEndpoint(443);
    const n8n = await checkEndpoint(8443);
    
    console.log("Final Evaluation -> OC Ready:", oc, " | n8n Ready:", n8n);
}

test();
