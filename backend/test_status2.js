const https = require('https');

const checkEndpoint = (port, path='/') => {
    return new Promise((resolve) => {
        const reqUrl = `https://34.136.215.118:${port}${path}`;
        const request = https.get(reqUrl, { rejectUnauthorized: false, timeout: 5000 }, (response) => {
            console.log(`Port ${port} responded with status:`, response.statusCode);
            
            // CRITICAL: You must consume the response data to free up memory/socket, 
            // otherwise the HTTPS request hangs indefinitely in newer Node versions!
            response.on('data', () => {}); 
            response.on('end', () => resolve(response.statusCode < 500));
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
    console.log("Starting robust debug probe...");
    const oc = await checkEndpoint(443);
    const n8n = await checkEndpoint(8443, '/login'); 
    
    console.log("Final Evaluation -> OC Ready:", oc, " | n8n Ready:", n8n);
}

test();
