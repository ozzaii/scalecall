#!/bin/bash

# Remove specific unused imports
sed -i '' 's/, Clock//g' src/components/ActionItems.tsx
sed -i '' 's/, Users//g' src/components/AnalyticsDashboard.tsx
sed -i '' 's/, GitBranch//g' src/components/CallDetails.tsx
sed -i '' 's/, getScoreColor//g' src/components/CallDetails.tsx
sed -i '' 's/, getSentimentColor//g' src/components/CallDetails.tsx
sed -i '' 's/, ConversationDynamics//g' src/components/ComprehensiveMetrics.tsx
sed -i '' 's/import { cn } from '\''\.\.\/lib\/utils'\'';*$//g' src/components/ExportMenu.tsx
sed -i '' 's/, getSentimentColor//g' src/components/Sidebar.tsx
sed -i '' 's/, PhoneOutgoing//g' src/components/Sidebar.tsx
sed -i '' 's/, Filter//g' src/components/Sidebar.tsx
sed -i '' 's/, Users//g' src/components/Sidebar.tsx
sed -i '' 's/, Star//g' src/components/PerformanceMetrics.tsx
sed -i '' 's/, X//g' src/components/OnboardingModal.tsx
sed -i '' 's/, ArrowRight//g' src/components/OnboardingModal.tsx
sed -i '' 's/, Check//g' src/components/OnboardingModal.tsx
sed -i '' 's/, Play//g' src/components/OnboardingModal.tsx
sed -i '' 's/import { cn } from '\''\.\.\/lib\/utils'\'';*$//g' src/components/OnboardingModal.tsx
sed -i '' 's/, CallJourneyStep//g' src/services/gemini.ts

# Remove Button import from ActionItems if it's on its own line
sed -i '' '/^import.*Button.*from.*button.*;$/d' src/components/ActionItems.tsx

# Remove Progress import from PerformanceMetrics if it's on its own line  
sed -i '' '/^import.*Progress.*from.*progress.*;$/d' src/components/PerformanceMetrics.tsx

# Remove WaveformVisualizer import from LiveCallMonitor if it's on its own line
sed -i '' '/^import.*WaveformVisualizer.*from.*WaveformVisualizer.*;$/d' src/components/LiveCallMonitor.tsx

echo "Removed unused imports!"