import { supabaseService } from '../services/supabase';
import { geminiService } from '../services/gemini';

async function regenerateAnalytics() {
  console.log('Starting analytics regeneration...');
  
  try {
    // Get all calls from database
    const calls = await supabaseService.getCalls(100);
    console.log(`Found ${calls.length} calls to update`);
    
    let updated = 0;
    
    for (const call of calls) {
      try {
        // Generate new analytics with timeline and emotions
        const analytics = geminiService.generateMockAnalytics(call);
        
        // Save to database
        const saved = await supabaseService.saveAnalytics(call.id, call.conversationId, analytics);
        
        if (saved) {
          updated++;
          console.log(`✓ Updated analytics for call ${call.id} (${call.customerName})`);
        }
        
        // Delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`✗ Failed to update call ${call.id}:`, error);
      }
    }
    
    console.log(`\nCompleted! Updated ${updated} out of ${calls.length} calls`);
  } catch (error) {
    console.error('Failed to regenerate analytics:', error);
  }
}

// Run the script
regenerateAnalytics();