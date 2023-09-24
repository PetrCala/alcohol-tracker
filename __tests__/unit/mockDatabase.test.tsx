import {
    initializeEmptyMockDatabase,
    createMockConfig,
    createMockFeedback,
    createMockCurrentSession,
    createMockUnitsObject,
    createMockSession,
    createMockPreferences,
    createMockUnconfirmedDays,
    createMockUserData,
    createMockDatabase
  } from '../../src/utils/testing/mockDatabase';

describe('mockDatabase functions', () => {
  
    it('should initialize an empty mock database', () => {
      const db = initializeEmptyMockDatabase();
      expect(db).toBeDefined();
      expect(db.config.app_settings.min_supported_version).toBe('0.0.1');
    });
  
    it('should create a mock config', () => {
      const config = createMockConfig('0.0.2');
      expect(config.app_settings.min_supported_version).toBe('0.0.2');
    });
  
    it('should create a mock feedback object', () => {
      const feedback = createMockFeedback();
      expect(feedback).toBeDefined();
      expect(feedback.text).toBe('Mock feedback');
    });
  
    it('should create a mock current session', () => {
      const session = createMockCurrentSession('mock-session-id');
      expect(session.current_session_id).toBe('mock-session-id');
    });
  
    it('should create a mock units object', () => {
      const units = createMockUnitsObject({ wine: 5 });
      expect(units).toBeDefined();
      expect(Object.values(units)[0].wine).toBe(5);
    });
  
    it('should create a mock session', () => {
      const session = createMockSession(new Date());
      expect(session).toBeDefined();
      expect(session.start_time).toBeLessThan(session.end_time);
    });
  
    it('should create mock preferences', () => {
      const preferences = createMockPreferences();
      expect(preferences).toBeDefined();
      expect(['Monday', 'Sunday']).toContain(preferences.first_day_of_week);
    });
  
    it('should create mock unconfirmed days', () => {
      const unconfirmedDays = createMockUnconfirmedDays();
      expect(unconfirmedDays).toBeDefined();
      expect(Object.keys(unconfirmedDays).length).toBeGreaterThanOrEqual(1);
    });
  
    it('should create mock user data', () => {
      const userData = createMockUserData();
      expect(userData).toBeDefined();
      expect(userData.role).toBe('mock-user');
    });
  
    it('should create a mock database', () => {
      const db = createMockDatabase();
      expect(db).toBeDefined();
      expect(Object.keys(db.feedback).length).toBe(5);
    });
  
  });
  