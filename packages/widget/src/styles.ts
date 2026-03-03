export const styles = `
:host {
  display: block;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  font-size: 14px;
  color: #1a1a1a;
  line-height: 1.5;
}

*, *::before, *::after {
  box-sizing: border-box;
}

.frankly-wrapper {
  max-width: 720px;
  margin: 0 auto;
}

/* ── Cards ── */

.frankly-card {
  background: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  padding: 20px;
}

.frankly-card + .frankly-card {
  margin-top: 16px;
}

.frankly-card-header {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e5e5e5;
  color: #1a1a1a;
}

/* ── Stars ── */

.stars {
  display: inline-flex;
  gap: 1px;
  font-size: 16px;
  line-height: 1;
}

.stars .star {
  color: #d4d4d4;
}

.stars .star.filled {
  color: #f59e0b;
}

.stars-interactive {
  display: inline-flex;
  gap: 2px;
  font-size: 22px;
  cursor: pointer;
  user-select: none;
  line-height: 1;
}

.stars-interactive .star {
  color: #d4d4d4;
  transition: color 0.15s ease;
}

.stars-interactive .star.filled {
  color: #f59e0b;
}

.stars-interactive .star:hover {
  color: #f59e0b;
}

/* ── Stats header ── */

.stats-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.stats-avg {
  font-size: 40px;
  font-weight: 700;
  line-height: 1;
  color: #1a1a1a;
}

.stats-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stats-count {
  font-size: 13px;
  color: #737373;
}

.stats-locale {
  font-size: 11px;
  color: #a3a3a3;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* ── Distribution bar chart ── */

.distribution {
  margin-bottom: 20px;
}

.dist-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.dist-label {
  width: 16px;
  font-size: 12px;
  font-weight: 500;
  color: #737373;
  text-align: right;
  flex-shrink: 0;
}

.dist-star {
  color: #f59e0b;
  font-size: 12px;
  flex-shrink: 0;
}

.dist-bar-bg {
  flex: 1;
  height: 8px;
  background: #f5f5f5;
  border-radius: 4px;
  overflow: hidden;
}

.dist-bar-fill {
  height: 100%;
  background: #f59e0b;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.dist-count {
  width: 28px;
  font-size: 12px;
  color: #a3a3a3;
  text-align: right;
  flex-shrink: 0;
}

/* ── Review list ── */

.review-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.review-item {
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
}

.review-item:last-child {
  border-bottom: none;
}

.review-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
  gap: 8px;
}

.review-title {
  font-weight: 600;
  font-size: 14px;
  color: #1a1a1a;
}

.review-body {
  margin: 8px 0;
  line-height: 1.6;
  color: #404040;
  font-size: 14px;
}

.review-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #a3a3a3;
  font-size: 12px;
}

.review-meta-sep {
  color: #d4d4d4;
}

/* ── Verified purchase badge ── */

.verified-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 500;
  color: #16a34a;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 9999px;
  padding: 2px 8px;
}

.verified-badge-icon {
  font-size: 12px;
  line-height: 1;
}

/* ── Photo thumbnails ── */

.review-photos {
  display: flex;
  gap: 8px;
  margin-top: 8px;
  flex-wrap: wrap;
}

.review-photo-thumb {
  width: 56px;
  height: 56px;
  border-radius: 6px;
  object-fit: cover;
  border: 1px solid #e5e5e5;
  cursor: pointer;
  transition: opacity 0.15s ease;
}

.review-photo-thumb:hover {
  opacity: 0.8;
}

/* ── Form ── */

.form-group {
  margin-bottom: 12px;
}

.form-label {
  display: block;
  margin-bottom: 4px;
  font-weight: 500;
  font-size: 13px;
  color: #404040;
}

.form-input {
  font-family: inherit;
  font-size: 14px;
  background: #ffffff;
  border: 1px solid #d4d4d4;
  border-radius: 6px;
  padding: 8px 12px;
  outline: none;
  width: 100%;
  color: #1a1a1a;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.form-input:focus {
  border-color: #a3a3a3;
  box-shadow: 0 0 0 3px rgba(163, 163, 163, 0.15);
}

.form-input::placeholder {
  color: #a3a3a3;
}

textarea.form-input {
  resize: vertical;
  min-height: 80px;
}

.form-row {
  display: flex;
  gap: 12px;
}

.form-row .form-group {
  flex: 1;
}

.form-file-input {
  font-family: inherit;
  font-size: 13px;
  color: #737373;
}

.form-file-label {
  display: block;
  margin-bottom: 4px;
  font-weight: 500;
  font-size: 13px;
  color: #404040;
}

.form-file-hint {
  font-size: 11px;
  color: #a3a3a3;
  margin-top: 4px;
}

.form-actions {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

/* ── Button ── */

.frankly-btn {
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
  background: #1a1a1a;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  padding: 8px 20px;
  cursor: pointer;
  transition: background 0.15s ease;
}

.frankly-btn:hover {
  background: #333333;
}

.frankly-btn:active {
  background: #0a0a0a;
}

.frankly-btn:disabled {
  background: #a3a3a3;
  cursor: not-allowed;
}

.frankly-btn:focus-visible {
  outline: 2px solid #1a1a1a;
  outline-offset: 2px;
}

.frankly-btn-secondary {
  background: #f5f5f5;
  color: #1a1a1a;
  border: 1px solid #e5e5e5;
}

.frankly-btn-secondary:hover {
  background: #e5e5e5;
}

.frankly-btn-secondary:active {
  background: #d4d4d4;
}

/* ── Messages ── */

.msg-success {
  background: #f0fdf4;
  color: #16a34a;
  border: 1px solid #bbf7d0;
  border-radius: 6px;
  padding: 10px 14px;
  margin-bottom: 12px;
  font-size: 13px;
  font-weight: 500;
}

.msg-error {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
  border-radius: 6px;
  padding: 10px 14px;
  margin-bottom: 12px;
  font-size: 13px;
  font-weight: 500;
}

/* ── Loading ── */

.loading {
  text-align: center;
  padding: 32px;
  color: #a3a3a3;
  font-size: 14px;
}

/* ── Empty state ── */

.empty-state {
  text-align: center;
  padding: 24px;
  color: #a3a3a3;
  font-size: 14px;
}

/* ── Pagination ── */

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
  padding: 12px 0;
}

.pagination-info {
  font-size: 13px;
  color: #737373;
}

/* ── Responsive ── */

@media (max-width: 480px) {
  .frankly-card {
    padding: 14px;
    border-radius: 6px;
  }

  .form-row {
    flex-direction: column;
    gap: 0;
  }

  .stats-avg {
    font-size: 32px;
  }

  .review-photos {
    gap: 6px;
  }

  .review-photo-thumb {
    width: 48px;
    height: 48px;
  }
}
`;
