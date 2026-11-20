// server/src/utils/pagination.js
import { PAGE_SIZE_DEFAULT, PAGE_SIZE_MAX } from '../config/constants.js';

/**
 * Parses and clamps pagination parameters
 * @param {Object} query - Express request query
 * @returns {{ page: number, pageSize: number, skip: number, limit: number }}
 */
export function parsePagination(query = {}) {
  let page = parseInt(query.page, 10);
  if (isNaN(page) || page < 1) {
    page = 1;
  }

  let pageSize = parseInt(query.pageSize, 10);
  if (isNaN(pageSize) || pageSize < 1) {
    pageSize = PAGE_SIZE_DEFAULT;
  }
  if (pageSize > PAGE_SIZE_MAX) {
    pageSize = PAGE_SIZE_MAX;
  }

  const skip = (page - 1) * pageSize;
  const limit = pageSize;

  return { page, pageSize, skip, limit };
}

/**
 * Constructs standard pagination metadata
 * @param {number} total - Total number of matching documents
 * @param {number} page - Current page
 * @param {number} pageSize - Clamped page size
 * @returns {{ page: number, pageSize: number, total: number, totalPages: number }}
 */
export function buildPaginationMeta(total, page, pageSize) {
  const totalPages = Math.ceil(total / pageSize) || 1;
  return {
    page,
    pageSize,
    total,
    totalPages
  };
}
