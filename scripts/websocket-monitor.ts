import { WebSocket } from 'ws';

async function monitorWebSocket() {
  console.log('🔌 WebSocket Uptime Monitor\n');
  
  let successCount = 0;
  let failCount = 0;
  const testCount = 10;
  
  for (let i = 0; i < testCount; i++) {
    try {
      const ws = new WebSocket('ws://localhost:5000/ws/notifications');
      
      await new Promise<void>((resolve, reject) => {
        ws.on('open', () => {
          successCount++;
          ws.close();
          resolve();
        });
        
        ws.on('error', () => {
          failCount++;
          reject();
        });
        
        setTimeout(() => reject(new Error('Timeout')), 5000);
      });
    } catch (error) {
      failCount++;
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  const uptime = (successCount / testCount) * 100;
  console.log(`Total tests: ${testCount}`);
  console.log(`Successful: ${successCount}`);
  console.log(`Failed: ${failCount}`);
  console.log(`Uptime: ${uptime.toFixed(2)}%\n`);
  
  if (uptime >= 99) {
    console.log('✅ WebSocket uptime exceeds 99% target');
  } else {
    console.log(`⚠️ WebSocket uptime below 99% target`);
  }
}

monitorWebSocket().catch(console.error);
