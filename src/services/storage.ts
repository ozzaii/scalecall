import { CallData } from '../types';

const STORAGE_KEY = 'turkcell_call_history';
const MAX_STORED_CALLS = 100;

export const storageService = {
  // Save calls to localStorage
  saveCalls(calls: CallData[]): void {
    try {
      // Keep only the most recent calls
      const callsToStore = calls.slice(0, MAX_STORED_CALLS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(callsToStore));
    } catch (error) {
      console.error('Failed to save calls to localStorage:', error);
    }
  },

  // Load calls from localStorage
  loadCalls(): CallData[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const calls = JSON.parse(stored);
        // Convert date strings back to Date objects with validation
        return calls.map((call: any) => {
          const startTime = new Date(call.startTime);
          const endTime = call.endTime ? new Date(call.endTime) : undefined;
          const handoffTimestamp = call.handoffTimestamp ? new Date(call.handoffTimestamp) : undefined;
          
          // Validate dates
          if (!isFinite(startTime.getTime())) {
            console.warn('Invalid startTime for call:', call.id);
            return null;
          }
          
          if (endTime && !isFinite(endTime.getTime())) {
            console.warn('Invalid endTime for call:', call.id);
          }
          
          return {
            ...call,
            startTime,
            endTime: endTime && isFinite(endTime.getTime()) ? endTime : undefined,
            handoffTimestamp: handoffTimestamp && isFinite(handoffTimestamp.getTime()) ? handoffTimestamp : undefined
          };
        }).filter(call => call !== null);
      }
    } catch (error) {
      console.error('Failed to load calls from localStorage:', error);
      // Clear corrupted data
      localStorage.removeItem(STORAGE_KEY);
    }
    return [];
  },

  // Clear stored calls
  clearCalls(): void {
    localStorage.removeItem(STORAGE_KEY);
  },

  // Export calls to CSV
  exportToCSV(calls: CallData[]): void {
    const headers = [
      'ID', 'Müşteri', 'Telefon', 'Agent', 'Başlangıç', 'Bitiş', 
      'Süre (sn)', 'Durum', 'Memnuniyet', 'Duygu'
    ];

    const rows = calls.map(call => [
      call.id,
      call.customerName || 'Bilinmiyor',
      call.phoneNumber,
      call.agentName,
      call.startTime.toLocaleString('tr-TR'),
      call.endTime?.toLocaleString('tr-TR') || '-',
      call.duration || '-',
      call.status === 'completed' ? 'Tamamlandı' : 'Aktif',
      call.analytics?.customerSatisfaction || '-',
      call.analytics?.sentiment.overall || '-'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `turkcell_calls_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  },

  // Export analytics to JSON
  exportAnalytics(calls: CallData[]): void {
    const analyticsData = calls
      .filter(call => call.analytics)
      .map(call => ({
        callId: call.id,
        customerName: call.customerName,
        date: call.startTime,
        analytics: call.analytics
      }));

    const blob = new Blob([JSON.stringify(analyticsData, null, 2)], { 
      type: 'application/json' 
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `turkcell_analytics_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  }
};