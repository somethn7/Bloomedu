import { Platform } from 'react-native';

// Merkezi API yapılandırması
// Port değiştiğinde sadece buradan güncelleyin
export const API_BASE_URL = Platform.OS === 'android' 
  ? 'http://10.0.2.2:8080' 
  : 'http://localhost:8080';

// API endpoint'leri
export const API_ENDPOINTS = {
  // Auth
  PARENT_LOGIN: '/parent/login',
  PARENT_SIGNUP: '/parent/signup',
  PARENT_RESET_PASSWORD: '/parent/reset-password',
  TEACHER_LOGIN: '/teacher/login',
  
  // Children
  CHILDREN_BY_PARENT: (parentId: number) => `/children/by-parent/${parentId}`,
  CHILDREN_BY_TEACHER: (teacherId: number) => `/children/${teacherId}`,
  UPDATE_CHILD_LEVEL: (childId: number) => `/children/${childId}/update-level`,
  
  // Games
  GAME_SESSION: '/game-session',
  
  // Progress
  PROGRESS: (childId: number) => `/progress/${childId}`,
  
  // Health
  HEALTH: '/health',
};


