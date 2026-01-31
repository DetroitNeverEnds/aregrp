import { initializeApiClient } from '../api';

initializeApiClient({
    baseURL: '/api/v1',
    timeout: 5000,
});
