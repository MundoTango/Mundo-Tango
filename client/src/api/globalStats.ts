import axios, { AxiosError } from 'axios';

async function fetchGlobalStats() {
  try {
    const response = await axios.get('/api/community/global-stats');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'];
      console.log(`Rate limit exceeded. Retry after ${retryAfter} seconds.`);
      await new Promise(resolve => setTimeout(resolve, Number(retryAfter) * 1000));
      return fetchGlobalStats();
    } else {
      throw error;
    }
  }
}

export { fetchGlobalStats };