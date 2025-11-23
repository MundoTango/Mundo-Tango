import { MemoryStatsService } from '../services/MemoryStatsService';
import { useState, useEffect } from 'react';

export function MemoryStatsPage() {
  const [memoryStats, setMemoryStats] = useState<any>(null);
  const memoryStatsService = new MemoryStatsService();

  useEffect(() => {
    const fetchMemoryStats = async () => {
      try {
        const response = await memoryStatsService.getMemoryStats();
        setMemoryStats(response.data);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          // Handle unauthorized error
          console.log('Unauthorized');
        } else {
          console.error('Error fetching memory stats:', error);
        }
      }
    };
    fetchMemoryStats();
  }, []);

  return (
    <div>
      {memoryStats ? (
        <p>Memory Stats: {memoryStats.message}</p>
      ) : (
        <p>Loading memory stats...</p>
      )}
    </div>
  );
}