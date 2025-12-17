import axios from 'axios';

async function fetchGlobalStats() {
  try {
    const response = await axios.get('/api/community/global-stats');
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 429) {
      const retryAfter = error.response.headers['retry-after'];
      console.log(`Rate limit exceeded. Retry after ${retryAfter} seconds.`);
      await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
      return fetchGlobalStats();
    } else {
      throw error;
    }
  }
}

export { fetchGlobalStats };