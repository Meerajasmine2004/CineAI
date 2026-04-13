const { spawn } = require('child_process');
const axios = require('axios');

console.log('Starting ngrok tunnel for port 5000...');

// Start ngrok
const ngrok = spawn('ngrok', ['http', '5000'], { stdio: ['pipe', 'pipe', 'pipe'] });

let ngrokUrl = '';

ngrok.stdout.on('data', (data) => {
  const output = data.toString();
  console.log('ngrok output:', output);
  
  // Extract URL from output
  const urlMatch = output.match(/https:\/\/[a-zA-Z0-9.-]+\.ngrok[^\\s]*/);
  if (urlMatch && !ngrokUrl) {
    ngrokUrl = urlMatch[0];
    console.log('\n=== NGROK URL FOUND ===');
    console.log('Public URL:', ngrokUrl);
    console.log('Webhook URL:', ngrokUrl + '/api/chatbot/webhook');
    console.log('========================\n');
    
    console.log('Update this URL in Dialogflow Fulfillment:');
    console.log(ngrokUrl + '/api/chatbot/webhook');
  }
});

ngrok.stderr.on('data', (data) => {
  console.error('ngrok error:', data.toString());
});

ngrok.on('close', (code) => {
  console.log(`ngrok process exited with code ${code}`);
});

// Keep process running
process.on('SIGINT', () => {
  ngrok.kill();
  process.exit(0);
});
