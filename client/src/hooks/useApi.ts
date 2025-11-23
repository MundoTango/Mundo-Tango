import { useState, useEffect } from 'react';
import axios from 'axios';

const useApi = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      const response = await axios.get('/api/mrblue/save-backend/status/20029');
      setData(response.data);
    } catch (error) {
      if (error.response && error.response.status === 429) {
        setError('Rate limit exceeded. Please try again later.');
      } else {
        setError(error.message);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, error };
};

export default useApi;