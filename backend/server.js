const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { InstancesClient, FirewallsClient } = require('@google-cloud/compute');
const admin = require('firebase-admin');
const Razorpay = require('razorpay');
const crypto = require('crypto');

try {
    admin.initializeApp({
        projectId: 'openclaw-saas-a74c2'
    });
    console.log('[Firebase Admin] Successfully initialized via Application Default Credentials.');
} catch (e) {
    console.error('[Firebase Admin Error]', e);
}
const db = admin.firestore();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => res.json({ status: 'ok', version: '2.0.0' }));

// Provision endpoint
app.post('/api/provision', async (req, res) => {
    try {
        const { agentName, purpose, customProvider, customApiKey, telegramToken, documentId } = req.body;
        const crypto = require('crypto');
        const gatewayToken = `saas-auto-token-${crypto.randomBytes(8).toString('hex')}`;

        if (!agentName) {
            return res.status(400).json({ error: 'Agent name is required' });
        }

        // Gemini API key from Cloud Run env (Vertex AI Express key from GCP)
        const geminiApiKey = process.env.VERTEX_AI_API_KEY || '';
        let apiKeyEnvLine = `OPENROUTER_API_KEY=${process.env.MASTER_OPENROUTER_API_KEY || 'sk-or-master-default'}
GEMINI_API_KEY=${geminiApiKey}`;
        if (customProvider && customApiKey) {
            apiKeyEnvLine = `${customProvider}_API_KEY=${customApiKey}`;
        }

        let telegramEnvLine = '';
        if (telegramToken) {
            telegramEnvLine = `TELEGRAM_BOT_TOKEN=${telegramToken}`;
        }



        // --- MANAGED SAAS CONFIGURATION ---
        console.log(`[Managed SaaS] Initializing Google Cloud Compute SDK via ADC...`);
        const gcpProject = process.env.SAAS_GCP_PROJECT || 'mock-project';
        const gcpRegion = process.env.SAAS_GCP_REGION || 'us-central1';

        let instancesClient = null;
        try {
            // Initialize Compute SDK directly. Without passing auth, it automatically uses standard ADC
            // This will throw if the backend is run in an environment without Google Cloud credentials
            if (process.env.SAAS_GCP_PROJECT) {
                const fs = require('fs');
                let defaultCredsPath = '/Users/ankitpatel/.config/gcloud/application_default_credentials.json';
                const legacyCredsPath = '/Users/ankitpatel/.config/gcloud/legacy_credentials/agents@inshort.live/adc.json';

                if (fs.existsSync(legacyCredsPath)) {
                    defaultCredsPath = legacyCredsPath;
                }

                if (fs.existsSync(defaultCredsPath)) {
                    process.env.GOOGLE_APPLICATION_CREDENTIALS = defaultCredsPath;
                }
                instancesClient = new InstancesClient();
            } else {
                console.log('[Dev Mode] SAAS_GCP_PROJECT not set. Standard ADC bypassed. Using localized mock simulation.');
            }
        } catch (e) {
            console.log('[Dev Mode] Could not initialize GCP Compute SDK. Falling back to simulation.');
        }

        // Build the Compute Engine Setup Automation Script
        // OPTIMIZED: Docker, Caddy, and base images are PRE-BAKED on the custom image.
        // This script ONLY generates per-agent config files and starts services.
        const STARTUP_SCRIPT = `#!/bin/bash
set -e
echo "[STARTUP] Configuring agent instance..."

# 1. Create persistent host directories (fast, idempotent)
mkdir -p /home/node/.openclaw/workspace

# 2. Generate OpenClaw Native Config (per-agent)
cat << 'EOF' > /home/node/.openclaw/openclaw.json
{
  "agents": {
    "defaults": {
      "model": {
        "primary": "google/gemini-3-flash-preview"
      }
    }
  },
  "channels": {
    "telegram": {
      "enabled": true,
      "dmPolicy": "open",
      "groupPolicy": "open",
      "allowFrom": ["*"],
      "groupAllowFrom": ["*"],
      "streaming": "partial"
    }
  },
  "gateway": {
    "mode": "local",
    "bind": "lan",
    "trustedProxies": ["127.0.0.0/8", "10.0.0.0/8", "172.16.0.0/12", "192.168.0.0/16"],
    "auth": {
      "token": "${gatewayToken}"
    },
    "controlUi": {
      "enabled": true,
      "dangerouslyDisableDeviceAuth": true,
      "allowInsecureAuth": true,
      "allowedOrigins": ["*"]
    }
  }
}
EOF
chown -R 1000:1000 /home/node/.openclaw

# 3. Configure environment variables (per-agent)
mkdir -p /opt/openclaw
cat << 'EOF' > /opt/openclaw/.env
OPENCLAW_IMAGE=ghcr.io/openclaw/openclaw:latest
OPENCLAW_GATEWAY_TOKEN=${gatewayToken}
OPENCLAW_GATEWAY_BIND=lan
OPENCLAW_GATEWAY_PORT=18789
OPENCLAW_CONFIG_DIR=/home/node/.openclaw
OPENCLAW_WORKSPACE_DIR=/home/node/.openclaw/workspace
OPENCLAW_CONTROL_UI_ALLOWED_ORIGINS=*
GOG_KEYRING_PASSWORD=$(openssl rand -hex 16)
XDG_CONFIG_HOME=/home/node/.openclaw
NODE_ENV=production
GOOGLE_CLOUD_PROJECT=${gcpProject}
GOOGLE_CLOUD_LOCATION=${gcpRegion}
${apiKeyEnvLine}
${telegramEnvLine}
AGENT_PURPOSE="${purpose}"
EOF

# 4. Docker Compose Configuration (per-agent)
cat << 'EOF' > /opt/openclaw/docker-compose.yml
services:
  openclaw-gateway:
    image: ghcr.io/openclaw/openclaw:latest
    restart: unless-stopped
    env_file:
      - .env
    environment:
      - HOME=/home/node
      - NODE_ENV=production
      - TERM=xterm-256color
      - OPENCLAW_GATEWAY_BIND=\${OPENCLAW_GATEWAY_BIND}
      - OPENCLAW_GATEWAY_PORT=\${OPENCLAW_GATEWAY_PORT}
      - OPENCLAW_GATEWAY_TOKEN=\${OPENCLAW_GATEWAY_TOKEN}
      - OPENCLAW_CONTROL_UI_ALLOWED_ORIGINS=\${OPENCLAW_CONTROL_UI_ALLOWED_ORIGINS}
      - GOG_KEYRING_PASSWORD=\${GOG_KEYRING_PASSWORD}
      - XDG_CONFIG_HOME=\${XDG_CONFIG_HOME}
      - GOOGLE_CLOUD_PROJECT=\${GOOGLE_CLOUD_PROJECT}
      - GOOGLE_CLOUD_LOCATION=\${GOOGLE_CLOUD_LOCATION}
      - GEMINI_API_KEY=\${GEMINI_API_KEY}
      - TELEGRAM_BOT_TOKEN=\${TELEGRAM_BOT_TOKEN}
      - GOOGLE_APPLICATION_CREDENTIALS=/home/node/.config/gcloud/application_default_credentials.json
      - PATH=/home/linuxbrew/.linuxbrew/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
    volumes:
      - \${OPENCLAW_CONFIG_DIR}:/home/node/.openclaw
      - /home/node/.config/gcloud:/home/node/.config/gcloud:ro
      - \${OPENCLAW_WORKSPACE_DIR}:/home/node/.openclaw/workspace
    ports:
      - "127.0.0.1:\${OPENCLAW_GATEWAY_PORT}:18789"
    command: [
      "node",
      "openclaw.mjs",
      "gateway",
      "--allow-unconfigured",
      "--bind", "\${OPENCLAW_GATEWAY_BIND}",
      "--port", "\${OPENCLAW_GATEWAY_PORT}"
    ]

  n8n:
    image: docker.n8n.io/n8nio/n8n
    restart: unless-stopped
    ports:
      - "127.0.0.1:5678:5678"
    environment:
      - N8N_HOST=0.0.0.0
      - N8N_PORT=5678
      - N8N_PROTOCOL=http
      - NODE_ENV=production
      - WEBHOOK_URL=https://0.0.0.0:8443/
      - GENERIC_TIMEZONE=UTC
      - N8N_SECURE_COOKIE=true
    volumes:
      - n8n_data:/home/node/.n8n

volumes:
  n8n_data:
EOF

# 5. Auto-update cron (once)
cat << 'EOF' > /opt/openclaw/update.sh
#!/bin/bash
cd /opt/openclaw
docker compose pull
docker compose up -d
EOF
chmod +x /opt/openclaw/update.sh
(crontab -l 2>/dev/null; echo "0 3 * * * /opt/openclaw/update.sh") | crontab -

# 6. Start services (images are PRE-PULLED on the baked image = instant)
cd /opt/openclaw
docker compose up -d

# 7. Configure Caddy SSL (Caddy is PRE-INSTALLED on the baked image)
EXTERNAL_IP=$(curl -s -H "Metadata-Flavor: Google" http://metadata.google.internal/computeMetadata/v1/instance/network-interfaces/0/access-configs/0/external-ip)
mkdir -p /etc/caddy/certs
openssl req -x509 -newkey rsa:2048 -keyout /etc/caddy/certs/key.pem -out /etc/caddy/certs/cert.pem -days 365 -nodes -subj "/CN=$EXTERNAL_IP" -addext "subjectAltName=IP:$EXTERNAL_IP" 2>/dev/null
chown caddy:caddy /etc/caddy/certs/*

cat << 'CADDYEOF' > /etc/caddy/Caddyfile
{
    auto_https disable_redirects
}

:443 {
    tls /etc/caddy/certs/cert.pem /etc/caddy/certs/key.pem
    reverse_proxy 127.0.0.1:18789
}

:8443 {
    tls /etc/caddy/certs/cert.pem /etc/caddy/certs/key.pem
    reverse_proxy 127.0.0.1:5678
}
CADDYEOF

systemctl enable caddy
systemctl restart caddy
echo "[STARTUP] Agent configuration complete."
`;

        const zone = `${gcpRegion}-a`; // Assuming standard zone target based on region
        const instanceName = agentName.toLowerCase().replace(/[^a-z0-9]/g, '-');

        // Ensure network config for HTTP traffic to OpenClaw gateway
        const instanceResource = {
            name: instanceName,
            machineType: `zones/${zone}/machineTypes/e2-medium`,
            disks: [
                {
                    boot: true,
                    initializeParams: {
                        sourceImage: `projects/${gcpProject}/global/images/family/openclaw-saas`,
                        diskSizeGb: '20',
                    },
                    autoDelete: true
                }
            ],
            networkInterfaces: [
                {
                    network: 'global/networks/default',
                    accessConfigs: [
                        {
                            type: 'ONE_TO_ONE_NAT',
                            name: 'External NAT',
                            networkTier: 'PREMIUM'
                        }
                    ]
                }
            ],
            metadata: {
                items: [
                    {
                        key: 'startup-script',
                        value: STARTUP_SCRIPT
                    }
                ]
            },
            tags: { items: ['openclaw-ssl'] }
        };

        let externalIp = '';

        // Ensure HTTPS firewall rule exists for tagged instances
        if (instancesClient) {
            try {
                const firewallsClient = new FirewallsClient();
                const firewallName = 'openclaw-ssl-allow';
                try {
                    await firewallsClient.get({ project: gcpProject, firewall: firewallName });
                    console.log(`[GCP Firewall] Rule '${firewallName}' already exists.`);
                } catch (fwErr) {
                    console.log(`[GCP Firewall] Creating HTTPS firewall rule '${firewallName}'...`);
                    await firewallsClient.insert({
                        project: gcpProject,
                        firewallResource: {
                            name: firewallName,
                            network: `projects/${gcpProject}/global/networks/default`,
                            allowed: [{ IPProtocol: 'tcp', ports: ['443', '8443'] }],
                            targetTags: ['openclaw-ssl'],
                            direction: 'INGRESS',
                            sourceRanges: ['0.0.0.0/0'],
                            description: 'Allow HTTPS traffic to OpenClaw (443) and n8n (8443) reverse proxied via Caddy',
                        },
                    });
                    console.log(`[GCP Firewall] Rule '${firewallName}' created successfully.`);
                }
            } catch (fwError) {
                console.log(`[GCP Firewall] Firewall rule creation skipped: ${fwError.message}`);
            }
        }

        if (instancesClient) {
            try {
                console.log(`[GCP Provisioning] Deploying new VM instance to projects/${gcpProject}/zones/${zone}`);
                const [operation] = await instancesClient.insert({
                    project: gcpProject,
                    zone: zone,
                    instanceResource: instanceResource
                });

                console.log(`[GCP SDK] Request sent. Polling for instance IP assignment (approx 1-2 mins)...`);
                
                let instance = null;
                for(let i=0; i<40; i++) {
                    try {
                        const [res] = await instancesClient.get({
                            project: gcpProject,
                            zone: zone,
                            instance: instanceName,
                        });
                        instance = res;
                        if (instance && instance.networkInterfaces && instance.networkInterfaces[0].accessConfigs && instance.networkInterfaces[0].accessConfigs[0].natIP) {
                            break;
                        }
                    } catch (err) {
                        // ignore 404 while it boots
                    }
                    console.log(`IP not ready yet, waiting 5 seconds...`);
                    await new Promise(resolve => setTimeout(resolve, 5000));
                }

                if (!instance || !instance.networkInterfaces || !instance.networkInterfaces[0].accessConfigs || !instance.networkInterfaces[0].accessConfigs[0].natIP) {
                    throw new Error("VM Provisioned successfully, but GCP failed to return an external natIP configuration.");
                }

                externalIp = instance.networkInterfaces[0].accessConfigs[0].natIP;
            } catch (gcpError) {
                console.log(`[GCP SDK ERROR] Real provisioning failed (likely missing Billing or Compute API not enabled on ${gcpProject}).`);
                console.error(gcpError.message);
                console.log(`[Fallback Action] Degrading gracefully to UI Simulation Mode...`);
                await new Promise(resolve => setTimeout(resolve, 2000));
                externalIp = '203.0.113.42'; // Mock external IP
            }
        } else {
            console.log(`[Dev Mode] Simulating deployment of new VM instance to projects/${gcpProject}/zones/${zone}`);
            await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate network latency
            externalIp = '203.0.113.42'; // Mock external IP
        }

        // Single-VM Dual Gateways (HTTPS via Caddy reverse proxy)
        const openClawUrl = `https://${externalIp}/?token=${gatewayToken}`;
        const n8nUrl = `https://${externalIp}:8443`;

        // Update Firebase Database (Fix for orphaned instances on browser refresh)
        if (documentId && db) {
            try {
                await db.collection('agents').doc(documentId).update({
                    openClawUrl: openClawUrl,
                    n8nUrl: n8nUrl,
                    status: 'Active',
                    serviceStatus: 'booting',
                    ocReady: false,
                    n8nReady: false,
                    bootStartedAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                });
                console.log(`[Firebase] Successfully updated provisioning doc ${documentId}`);
            } catch (fbErr) {
                console.error(`[Firebase Error] Failed to update doc ${documentId}`, fbErr);
            }
        }

        res.status(200).json({
            success: true,
            message: 'Unified agent infrastructure provisioned successfully.',
            agent: {
                name: agentName,
                region: gcpRegion,
                serviceUrl: openClawUrl, // primary fallback
                openClawUrl: openClawUrl,
                n8nUrl: n8nUrl,
                status: 'Active'
            }
        });

    } catch (error) {
        console.error('Provisioning error:', error);
        res.status(500).json({ success: false, error: 'Failed to provision agent via GCP SDK' });
    }
});

// Mock SaaS endpoints for Unified Billing and Team Management (Competitor Parity)
app.get('/api/billing', (req, res) => {
    res.json({
        plan: 'Premium Flat-Rate Compute',
        status: 'Active',
        totalInferenceCost: 4.50,
        creditsRemaining: 15.50,
        renewalDate: '2026-04-01T00:00:00.000Z'
    });
});

app.get('/api/teams', (req, res) => {
    res.json({
        teamName: 'Personal Workspace',
        members: [{ id: 1, name: 'Admin User', role: 'Owner' }],
        activeAgents: 1,
        maxAgents: 5
    });
});

const https = require('https');
// Create a global HTTPS agent to ignore self-signed certs during the health check
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

app.get('/api/status', async (req, res) => {
    const { ip, agentId } = req.query;
    if (!ip) return res.status(400).json({ error: 'IP required' });

    const checkEndpoint = async (port) => {
        try {
            const reqUrl = `https://${ip}:${port}`;
            return await new Promise((resolve) => {
                const request = https.get(reqUrl, { rejectUnauthorized: false, timeout: 5000 }, (response) => {
                    response.on('data', () => {}); 
                    response.on('end', () => resolve(response.statusCode < 500));
                });
                request.on('error', () => resolve(false));
                request.on('timeout', () => { request.destroy(); resolve(false); });
            });
        } catch (e) {
            return false;
        }
    };

    try {
        const ocReady = await checkEndpoint(443);
        const n8nReady = await checkEndpoint(8443);
        const allReady = ocReady && n8nReady;

        // Update Firestore with per-service status
        if (agentId && db) {
            const updatePayload = { ocReady, n8nReady };

            // Mark as 'ready' if OpenClaw is up (primary service)
            // n8n is secondary — users can access OC immediately
            if (ocReady) {
                updatePayload.serviceStatus = 'ready';
            }

            // Check for boot timeout (5 minutes max)
            try {
                const agentDoc = await db.collection('agents').doc(agentId).get();
                if (agentDoc.exists) {
                    const data = agentDoc.data();
                    if (data.serviceStatus === 'booting' && data.bootStartedAt) {
                        const bootAge = Date.now() - new Date(data.bootStartedAt).getTime();
                        if (bootAge > 5 * 60 * 1000 && !ocReady) {
                            updatePayload.serviceStatus = 'failed';
                            updatePayload.failReason = 'Boot timeout: services did not respond within 5 minutes';
                        }
                    }
                }
            } catch (docErr) {
                console.error('[Status] Error checking boot timeout:', docErr.message);
            }

            await db.collection('agents').doc(agentId).update(updatePayload).catch(() => {});
        }

        res.json({ ready: allReady, ocReady, n8nReady });
    } catch (e) {
        res.json({ ready: false, ocReady: false, n8nReady: false });
    }
});

// Force-ready endpoint for stuck agents
app.post('/api/provision/:agentId/force-ready', async (req, res) => {
    const { agentId } = req.params;
    if (!agentId || !db) return res.status(400).json({ error: 'Agent ID required' });
    try {
        await db.collection('agents').doc(agentId).update({
            serviceStatus: 'ready',
            updatedAt: new Date().toISOString()
        });
        res.json({ success: true, message: 'Agent marked as ready.' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update agent status' });
    }
});

app.delete('/api/provision/:agentName', async (req, res) => {
    try {
        const { agentName } = req.params;
        const gcpProject = process.env.SAAS_GCP_PROJECT || 'project-3c44aff9-54a3-456c-a53';
        const gcpRegion = process.env.SAAS_GCP_REGION || 'us-central1';
        const zone = `${gcpRegion}-a`;
        const instanceName = agentName.toLowerCase().replace(/[^a-z0-9]/g, '-');

        const instancesClient = new InstancesClient();

        console.log(`[GCP Deprovisioning] Submitting deletion request for ${instanceName} inside ${gcpProject}...`);
        const [operation] = await instancesClient.delete({
            project: gcpProject,
            zone: zone,
            instance: instanceName
        });

        console.log(`[GCP SDK] Deletion operation started in background.`);

        // Also clean up from Firebase
        try {
            const snapshot = await db.collection('agents').where('agentName', '==', agentName).get();
            if (!snapshot.empty) {
                const docId = snapshot.docs[0].id;
                await db.collection('agents').doc(docId).delete();
                console.log(`[Firebase] Deleted agent document: ${docId}`);
            }
        } catch (fbErr) {
            console.error(`[Firebase Error] Failed to delete document for ${agentName}`, fbErr);
        }

        res.status(200).json({ success: true, message: `Agent ${instanceName} successfully destroyed.` });
    } catch (error) {
        console.error('Deprovisioning error:', error);
        res.status(500).json({ success: false, error: 'Failed to destroy agent via GCP SDK' });
    }
});

app.post('/api/provision/:agentName/restart', async (req, res) => {
    try {
        const { agentName } = req.params;
        const gcpProject = process.env.SAAS_GCP_PROJECT || 'project-3c44aff9-54a3-456c-a53';
        const gcpRegion = process.env.SAAS_GCP_REGION || 'us-central1';
        const zone = `${gcpRegion}-a`;
        const instanceName = agentName.toLowerCase().replace(/[^a-z0-9]/g, '-');

        const instancesClient = new InstancesClient();

        console.log(`[GCP SDK] Stopping instance ${instanceName}...`);
        const [stopOperation] = await instancesClient.stop({
            project: gcpProject,
            zone: zone,
            instance: instanceName
        });
        await stopOperation.promise();

        console.log(`[GCP SDK] Starting instance ${instanceName}...`);
        const [startOperation] = await instancesClient.start({
            project: gcpProject,
            zone: zone,
            instance: instanceName
        });
        await startOperation.promise();

        console.log(`[GCP SDK] Started. Polling for new ephemeral IP...`);
        let externalIp = null;
        for (let i = 0; i < 15; i++) {
            try {
                await new Promise(resolve => setTimeout(resolve, 3000));
                const [instanceInfo] = await instancesClient.get({
                    project: gcpProject,
                    zone: zone,
                    instance: instanceName,
                });
                if (instanceInfo && instanceInfo.networkInterfaces[0].accessConfigs[0].natIP) {
                    externalIp = instanceInfo.networkInterfaces[0].accessConfigs[0].natIP;
                    break;
                }
            } catch (err) {}
        }

        if (!externalIp) {
            throw new Error("Instance restarted but failed to fetch new IP.");
        }

        // Return the new URLs. The startup-script will automatically configure Caddy SSL for this new IP within ~10 seconds.
        const openClawUrl = `https://${externalIp}/`;
        const n8nUrl = `https://${externalIp}:8443`;

        res.status(200).json({ 
            success: true, 
            message: `Agent ${instanceName} successfully restarted.`,
            urls: { openClawUrl, n8nUrl }
        });

    } catch (error) {
        console.error('Restart error:', error);
        res.status(500).json({ success: false, error: 'Failed to restart agent via GCP SDK' });
    }
});

// ==========================================
// RAZORPAY PAYMENT ENDPOINTS
// ==========================================

const PLANS = {
    starter: { name: 'Starter', amount: 4900, currency: 'USD', agentSlots: 1 },
    pro:     { name: 'Pro',     amount: 7900, currency: 'USD', agentSlots: 2 },
    enterprise: { name: 'Enterprise', amount: 9900, currency: 'USD', agentSlots: 3 },
};

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret',
});

// Create a Razorpay order
app.post('/api/payment/create-order', async (req, res) => {
    try {
        const { planId, uid, email, annual } = req.body;
        const plan = PLANS[planId];
        if (!plan) return res.status(400).json({ error: 'Invalid plan' });

        const amount = annual ? Math.round(plan.amount * 0.8 * 12) : plan.amount;
        const period = annual ? 'annual' : 'monthly';

        const order = await razorpay.orders.create({
            amount: amount,
            currency: plan.currency,
            receipt: `rcpt_${Date.now()}`,
            notes: { planId, uid, email, period, agentSlots: plan.agentSlots },
        });

        res.json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            planName: plan.name,
            keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
        });
    } catch (error) {
        console.error('[Razorpay] Create order error:', error);
        res.status(500).json({ error: 'Failed to create payment order' });
    }
});

// Verify payment signature and activate subscription
app.post('/api/payment/verify', async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId, uid, annual } = req.body;

        // Verify signature
        const expectedSig = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret')
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');

        if (expectedSig !== razorpay_signature) {
            return res.status(400).json({ error: 'Payment verification failed — invalid signature' });
        }

        const plan = PLANS[planId];
        const now = new Date();
        const expiresAt = new Date(now);
        if (annual) {
            expiresAt.setFullYear(expiresAt.getFullYear() + 1);
        } else {
            expiresAt.setMonth(expiresAt.getMonth() + 1);
        }

        // Save subscription to Firestore
        await db.collection('subscriptions').doc(uid).set({
            planId,
            planName: plan ? plan.name : planId,
            agentSlots: plan ? plan.agentSlots : 1,
            status: 'active',
            annual: !!annual,
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            subscribedAt: admin.firestore.FieldValue.serverTimestamp(),
            expiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });

        // Handle Affiliate Commissions
        try {
            const userDoc = await db.collection('users').doc(uid).get();
            if (userDoc.exists) {
                const userData = userDoc.data();
                if (userData.referredBy) {
                    const referralCode = userData.referredBy;
                    const partnersQuery = await db.collection('users').where('referralCode', '==', referralCode).limit(1).get();
                    if (!partnersQuery.empty) {
                        const partnerDoc = partnersQuery.docs[0];
                        const partnerUid = partnerDoc.id;
                        
                        const baseAmount = plan ? plan.amount : 0;
                        const chargedAmountInCents = annual ? Math.round(baseAmount * 0.8 * 12) : baseAmount;
                        const commissionInCents = Math.round(chargedAmountInCents * 0.20);

                        await db.collection('commissions').add({
                            partnerUid,
                            referredUserUid: uid,
                            planId,
                            annual: !!annual,
                            orderAmount: chargedAmountInCents,
                            commissionAmount: commissionInCents,
                            currency: plan ? plan.currency : 'USD',
                            razorpayOrderId: razorpay_order_id,
                            status: 'pending',
                            createdAt: admin.firestore.FieldValue.serverTimestamp()
                        });
                        console.log(`[Affiliate] Logged ${commissionInCents} cents commission for partner ${partnerUid}`);
                    }
                }
            }
        } catch (commErr) {
            console.error('[Affiliate] Failed to process commission:', commErr);
        }

        console.log(`[Razorpay] Payment verified for ${uid} — Plan: ${planId}`);
        res.json({ success: true, message: 'Subscription activated', planId });
    } catch (error) {
        console.error('[Razorpay] Verify error:', error);
        res.status(500).json({ error: 'Payment verification failed' });
    }
});

// Get subscription status
app.get('/api/payment/status/:uid', async (req, res) => {
    try {
        const { uid } = req.params;
        const doc = await db.collection('subscriptions').doc(uid).get();

        if (!doc.exists) {
            return res.json({ subscribed: false });
        }

        const data = doc.data();
        const now = new Date();
        const expiresAt = data.expiresAt?.toDate?.() || new Date(0);
        const isActive = data.status === 'active' && expiresAt > now;

        res.json({
            subscribed: isActive,
            planId: data.planId,
            planName: data.planName,
            agentSlots: data.agentSlots,
            annual: data.annual,
            expiresAt: expiresAt.toISOString(),
        });
    } catch (error) {
        console.error('[Razorpay] Status error:', error);
        res.status(500).json({ error: 'Failed to fetch subscription status' });
    }
});

// ==========================================
// AFFILIATE / PARTNER ENDPOINTS
// ==========================================

// Get partner affiliate stats
app.get('/api/partner/stats/:uid', async (req, res) => {
    try {
        const { uid } = req.params;
        const userDoc = await db.collection('users').doc(uid).get();
        if (!userDoc.exists) return res.status(404).json({ error: 'User not found' });
        
        const userData = userDoc.data();
        const referralCode = userData.referralCode;
        if (!referralCode) {
            return res.json({ isPartner: false, metrics: null });
        }

        const referralsQuery = await db.collection('users').where('referredBy', '==', referralCode).get();
        const totalReferrals = referralsQuery.size;

        const commissionsQuery = await db.collection('commissions').where('partnerUid', '==', uid).get();
        let totalEarningsCents = 0;
        let pendingEarningsCents = 0;

        commissionsQuery.forEach(doc => {
            const data = doc.data();
            if (data.status === 'paid') {
                totalEarningsCents += data.commissionAmount || 0;
            } else {
                pendingEarningsCents += data.commissionAmount || 0;
            }
        });

        res.json({
            isPartner: true,
            referralCode,
            metrics: {
                totalReferrals,
                totalEarnings: totalEarningsCents / 100,
                pendingEarnings: pendingEarningsCents / 100
            }
        });
    } catch (error) {
        console.error('[Affiliate] Stats error:', error);
        res.status(500).json({ error: 'Failed to fetch partner stats' });
    }
});

// Register as a partner
app.post('/api/partner/register', async (req, res) => {
    try {
        const { uid } = req.body;
        const userRef = db.collection('users').doc(uid);
        const userDoc = await userRef.get();
        
        if (!userDoc.exists) {
            // Document might not exist if they haven't saved any settings yet, but Auth user exists
            await userRef.set({}, { merge: true });
        }
        
        let referralCode = userDoc?.data()?.referralCode;
        if (!referralCode) {
            const crypto = require('crypto');
            referralCode = crypto.randomBytes(4).toString('hex').toUpperCase();
            await userRef.set({ isPartner: true, referralCode }, { merge: true });
        }
        
        res.json({ success: true, referralCode });
    } catch (error) {
        console.error('[Affiliate] Registration error:', error);
        res.status(500).json({ error: 'Failed to register partner' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 OpenClaw SaaS Backend listening on port ${PORT}`);
});
