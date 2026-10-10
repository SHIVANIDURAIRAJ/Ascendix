import api from './api';

export const resumeService = {
  async uploadResume(file) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/resume/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async uploadResumeText(rawText, filename = 'resume.txt') {
    const response = await api.post('/resume/upload', {
      raw_text: rawText,
      filename,
    });
    return response.data;
  },

  async getLatestResume() {
    const response = await api.get('/resume/latest');
    return response.data;
  },
};
