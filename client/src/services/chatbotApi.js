import { authApi } from './authApi'

export function sendChatbotMessage(payload) {
  return authApi.post('/chatbot', payload)
}
