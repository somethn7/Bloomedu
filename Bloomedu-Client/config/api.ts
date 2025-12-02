// API Configuration
// Merkezi API URL yönetimi

// Railway production URL
export const API_BASE_URL = 'https://bloomedu-production.up.railway.app';

// Local development için alternatif:
// export const API_BASE_URL = 'http://10.0.2.2:3000'; // Android Emulator
// export const API_BASE_URL = 'http://localhost:3000'; // iOS Simulator

export const API_ENDPOINTS = {
  // Auth
  TEACHER_LOGIN: `${API_BASE_URL}/teacher/login`,
  PARENT_LOGIN: `${API_BASE_URL}/parent/login`,
  PARENT_SIGNUP: `${API_BASE_URL}/parent/signup`,
  PARENT_VERIFY: `${API_BASE_URL}/parent/verify-code`,
  
  // Children
  CHILDREN_BY_TEACHER: (teacherId: number) => `${API_BASE_URL}/children/${teacherId}`,
  CHILDREN_BY_PARENT: (parentId: number) => `${API_BASE_URL}/children/by-parent/${parentId}`,
  ADD_CHILD: `${API_BASE_URL}/teacher/add-child`,
  VERIFY_CHILD: `${API_BASE_URL}/parent/verify-child`,
  UPDATE_LEVEL: (childId: number) => `${API_BASE_URL}/children/${childId}/update-level`,
  MARK_SURVEY_COMPLETE: (childId: number) => `${API_BASE_URL}/children/${childId}/mark-survey-complete`,
  
  // Game Sessions
  GAME_SESSION: `${API_BASE_URL}/game-session`,
  GAME_SESSIONS_BY_CHILD: (childId: number) =>
    `${API_BASE_URL}/game-sessions/by-child/${childId}`,  // ⭐ YENİ EKLENDİ
  
  PROGRESS: (childId: number) => `${API_BASE_URL}/progress/${childId}`,
  
  // Feedback
  FEEDBACK: `${API_BASE_URL}/feedback`,
  FEEDBACKS_BY_PARENT: (parentId: number) => `${API_BASE_URL}/feedbacks/by-parent/${parentId}`,
  
  // Health
  HEALTH: `${API_BASE_URL}/health`,
};

// Oyun sonuçlarını database'e kaydetmek için helper fonksiyon
export const sendGameResult = async (data: {
  child_id: number;
  game_type: string;
  level: number;
  score: number;
  max_score: number;
  duration_seconds: number;
  completed: boolean;
}) => {
  try {
    const response = await fetch(API_ENDPOINTS.GAME_SESSION, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      console.error('❌ Backend error. Response status:', response.status);
      return { success: false, error: `HTTP ${response.status}` };
    }

    const result = await response.json();
    if (result.success) {
      console.log('✅ Game session saved successfully!', data.game_type);
    } else {
      console.warn('⚠️ Failed to save game session:', result.message);
    }
    return result;

  } catch (error) {
    console.error(
      '❌ Error sending game data:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
};
