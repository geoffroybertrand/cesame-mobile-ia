/**
 * Services Index - Sélection automatique API réel ou Mock
 */

import config from '../config';
import RealApiService from './api';
import MockApiService from './mockApi';

// Export le bon service en fonction de la config
const ApiService = config.demoMode ? MockApiService : RealApiService;

console.log(`[Services] Using ${config.demoMode ? 'MOCK' : 'REAL'} API service`);

export default ApiService;
