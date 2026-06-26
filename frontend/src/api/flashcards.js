import apiClient from './client';

export const flashcardApi = {
  getAllDecks: () => apiClient.get('/flashcards/decks'),
  getDeckById: (id) => apiClient.get(`/flashcards/decks/${id}`),
  createDeck: (data) => apiClient.post('/flashcards/decks', data),
  deleteDeck: (id) => apiClient.delete(`/flashcards/decks/${id}`),
  
  getDueCards: (deckId) => apiClient.get(`/flashcards/decks/${deckId}/due`),
  getGlobalDueCount: () => apiClient.get('/flashcards/due-count'),
  reviewCard: (cardId, quality) => apiClient.post(`/flashcards/cards/${cardId}/review`, { quality }),
};
