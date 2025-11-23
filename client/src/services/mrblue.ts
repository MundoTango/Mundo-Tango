import axios from 'axios';

export async function getConversations() {
  try {
    const response = await axios.get('/api/mrblue/conversations');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'] || 5;
      await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
      return getConversations();
    }
    throw error;
  }
}