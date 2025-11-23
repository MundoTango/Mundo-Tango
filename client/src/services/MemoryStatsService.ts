import { AuthService } from './auth.service';
import axios from 'axios';

export class MemoryStatsService {
  constructor(private authService: AuthService) {}

  getMemoryStats() {
    const authToken = this.authService.getAuthToken();
    const api = axios.create({
      baseURL: '/api',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    return api.get('/mrblue/memory/stats');
  }
}