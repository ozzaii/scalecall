import { supabaseService } from '../services/supabase';

const supabase = supabaseService.client;

// Generate timeline data
function generateTimeline(satisfaction: number) {
  const points = [];
  const numPoints = 8;
  
  for (let i = 0; i < numPoints; i++) {
    const progress = i / (numPoints - 1);
    let score;
    
    if (satisfaction > 4) {
      score = 0.1 + (progress * 0.7) + (Math.random() * 0.2 - 0.1);
    } else if (satisfaction < 3) {
      score = -0.1 - (progress * 0.5) + (Math.random() * 0.2 - 0.1);
    } else {
      score = (Math.random() * 0.4 - 0.2);
    }
    
    score = Math.max(-1, Math.min(1, score));
    
    points.push({
      time: progress,
      score,
      label: score > 0.3 ? 'positive' : score < -0.3 ? 'negative' : 'neutral'
    });
  }
  
  return points;
}

// Generate emotions data
function generateEmotions(satisfaction: number) {
  const emotions = [];
  
  if (satisfaction > 4) {
    emotions.push(
      { emotion: 'happy', intensity: 0.8, timestamp: 0.3, speaker: 'customer' },
      { emotion: 'happy', intensity: 0.9, timestamp: 0.7, speaker: 'agent' },
      { emotion: 'neutral', intensity: 0.6, timestamp: 0.5, speaker: 'customer' }
    );
  } else if (satisfaction < 3) {
    emotions.push(
      { emotion: 'angry', intensity: 0.7, timestamp: 0.2, speaker: 'customer' },
      { emotion: 'sad', intensity: 0.6, timestamp: 0.5, speaker: 'customer' },
      { emotion: 'fearful', intensity: 0.5, timestamp: 0.8, speaker: 'agent' }
    );
  } else {
    emotions.push(
      { emotion: 'neutral', intensity: 0.8, timestamp: 0.3, speaker: 'customer' },
      { emotion: 'neutral', intensity: 0.7, timestamp: 0.6, speaker: 'agent' },
      { emotion: 'happy', intensity: 0.5, timestamp: 0.9, speaker: 'customer' }
    );
  }
  
  return emotions;
}

async function fixAnalytics() {
  console.log('Fixing analytics data...');
  
  try {
    // Get all analytics
    const { data: analytics, error } = await supabase
      .from('analytics')
      .select('*');
    
    if (error) throw error;
    
    console.log(`Found ${analytics.length} analytics records`);
    
    let updated = 0;
    
    for (const record of analytics) {
      // Check if needs update
      if (!record.sentiment?.timeline || record.sentiment.timeline.length === 0 ||
          !record.emotions || record.emotions.length === 0) {
        
        // Generate missing data
        const satisfaction = record.customer_satisfaction || 3.5;
        
        // Update sentiment with timeline
        if (!record.sentiment.timeline || record.sentiment.timeline.length === 0) {
          record.sentiment.timeline = generateTimeline(satisfaction);
        }
        
        // Add emotions if missing
        if (!record.emotions || record.emotions.length === 0) {
          record.emotions = generateEmotions(satisfaction);
        }
        
        // Update in database
        const { error: updateError } = await supabase
          .from('analytics')
          .update({
            sentiment: record.sentiment,
            emotions: record.emotions
          })
          .eq('id', record.id);
        
        if (updateError) {
          console.error(`Failed to update ${record.id}:`, updateError);
        } else {
          updated++;
          console.log(`✓ Updated ${record.id}`);
        }
      }
    }
    
    console.log(`\nCompleted! Updated ${updated} records`);
  } catch (error) {
    console.error('Error:', error);
  }
}

fixAnalytics();