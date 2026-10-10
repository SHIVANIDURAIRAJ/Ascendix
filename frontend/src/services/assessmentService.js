import api from './api';

export const assessmentService = {
  /**
   * Fetch all calibration topics with student attempt stats
   */
  async getTopics() {
    const response = await api.get('/assessments/topics');
    return response.data;
  },

  /**
   * Retrieve sanitized questions for a topic quiz
   */
  async getQuiz(topicId) {
    const response = await api.get(`/assessments/quiz/${topicId}`);
    return response.data;
  },

  /**
   * Submit quiz answers and calibrate profile skills
   */
  async submitQuiz(topicId, answers, timeSpentSeconds = 0) {
    const response = await api.post('/assessments/submit', {
      topic_id: topicId,
      answers,
      time_spent_seconds: timeSpentSeconds,
    });
    return response.data;
  },

  /**
   * Retrieve student's past assessment history
   */
  async getHistory() {
    const response = await api.get('/assessments/history');
    return response.data;
  },
};
