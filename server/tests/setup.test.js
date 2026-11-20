// server/tests/setup.test.js
import { describe, it, expect } from 'vitest';
import { ErrorCodes } from '../src/utils/codes.js';
import {
  PLATFORM_FEE_PERCENT,
  PARTNER_BASE_FEE_PAISE,
  DEFAULT_MAX_DELIVERY_KM
} from '../src/config/constants.js';

describe('Phase 0 Scaffolding Setup', () => {
  it('loads constants correctly', () => {
    expect(PLATFORM_FEE_PERCENT).toBe(5);
    expect(PARTNER_BASE_FEE_PAISE).toBe(1500);
    expect(DEFAULT_MAX_DELIVERY_KM).toBe(30);
  });

  it('contains expected error codes', () => {
    expect(ErrorCodes.AUTH_REQUIRED).toBe('AUTH_REQUIRED');
    expect(ErrorCodes.INSUFFICIENT_STOCK).toBe('INSUFFICIENT_STOCK');
    expect(ErrorCodes.OUT_OF_DELIVERY_RANGE).toBe('OUT_OF_DELIVERY_RANGE');
  });
});
