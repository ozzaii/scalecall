
import { CallData } from '../types';

interface Props {
  activeCall: CallData | null;
}

export default function MetricsDebug({ activeCall }: Props) {
  if (!activeCall) return null;

  return (
    <div className="fixed bottom-20 right-4 p-4 glass-premium rounded-lg max-w-md">
      <h3 className="text-sm font-medium mb-2">Debug Info</h3>
      <div className="text-xs space-y-1 font-mono">
        <div>Call ID: {activeCall.id}</div>
        <div>Has Analytics: {activeCall.analytics ? 'YES' : 'NO'}</div>
        <div>Analytics Type: {activeCall.analytics ? Object.keys(activeCall.analytics).join(', ') : 'N/A'}</div>
        <div>Has CompMetrics: {(activeCall.analytics as any)?.comprehensiveMetrics ? 'YES' : 'NO'}</div>
        <div>Call Journey: {activeCall.callJourney ? `${activeCall.callJourney.length} steps` : 'None'}</div>
        <div>Agent Type: {activeCall.agentType || 'Unknown'}</div>
      </div>
    </div>
  );
}