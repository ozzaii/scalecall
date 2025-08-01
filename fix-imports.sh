#!/bin/bash

# Remove "import React" from all component files
find src/components -name "*.tsx" -type f -exec sed -i '' 's/import React, /import /g' {} +
find src/components -name "*.tsx" -type f -exec sed -i '' 's/import React from '\''react'\'';*$//g' {} +

# Fix the unsubscribe calls in App.tsx
sed -i '' 's/unsubscribeNewCalls?.()/unsubscribeNewCalls?.unsubscribe()/g' src/App.tsx
sed -i '' 's/unsubscribeCallUpdates?.()/unsubscribeCallUpdates?.unsubscribe()/g' src/App.tsx

echo "Fixed imports!"