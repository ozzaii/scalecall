// Simple script to update analytics for existing calls
// Run with: node updateAnalytics.js

async function updateAnalytics() {
  console.log('Updating analytics for existing calls...');
  
  // Open the app in browser and run this in the console:
  const updateCode = `
// Get all calls from the app
const calls = window.getCalls ? window.getCalls() : [];
console.log('Found', calls.length, 'calls to update');

// Update each call
calls.forEach(async (call, index) => {
  if (!call.analytics || !call.analytics.sentiment.timeline || call.analytics.sentiment.timeline.length === 0) {
    console.log('Updating call', call.id);
    
    // Force re-analyze
    try {
      await window.supabaseService.deleteAnalytics(call.id);
      console.log('Deleted old analytics for', call.id);
    } catch (e) {
      console.log('No old analytics to delete for', call.id);
    }
  }
});

console.log('Done! Refresh the page to re-generate analytics with new data.');
`;

  console.log('\n=== INSTRUCTIONS ===');
  console.log('1. Open your app in the browser');
  console.log('2. Open the browser console (F12)');
  console.log('3. Copy and paste this code:');
  console.log('\n' + updateCode);
  console.log('\n4. After running, refresh the page');
  console.log('5. The app will automatically regenerate analytics with sentiment timelines and emotions');
}

updateAnalytics();