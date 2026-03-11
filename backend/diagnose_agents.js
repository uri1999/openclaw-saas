const admin = require('firebase-admin');

// Initialize Firebase Admin SDK with the SaaS project
admin.initializeApp({
    projectId: 'openclaw-saas-a74c2'
});

const db = admin.firestore();

async function diagnose() {
    console.log('=== FIRESTORE AGENT DOCUMENTS DIAGNOSTIC ===\n');
    
    try {
        const snapshot = await db.collection('agents').get();
        
        if (snapshot.empty) {
            console.log('⚠️  No documents found in "agents" collection.');
            return;
        }
        
        console.log(`Found ${snapshot.size} agent document(s):\n`);
        
        snapshot.forEach((doc) => {
            const data = doc.data();
            console.log(`--- Document ID: ${doc.id} ---`);
            console.log(`  agentName:     ${data.agentName || 'N/A'}`);
            console.log(`  status:        ${data.status || 'N/A'}`);
            console.log(`  serviceStatus: ${data.serviceStatus || 'N/A'}`);
            console.log(`  openClawUrl:   ${data.openClawUrl || 'N/A'}`);
            console.log(`  n8nUrl:        ${data.n8nUrl || 'N/A'}`);
            console.log(`  ownerId:       ${data.ownerId || 'N/A'}`);
            console.log(`  createdAt:     ${data.createdAt || 'N/A'}`);
            console.log(`  updatedAt:     ${data.updatedAt || 'N/A'}`);
            console.log('');
        });
    } catch (err) {
        console.error('Error querying Firestore:', err.message);
    }
    
    process.exit(0);
}

diagnose();
