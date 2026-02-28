/**
 * 슈퍼어드민 공통 스타일 및 상수
 * 일관된 디자인 시스템을 위한 색상, 레이아웃, 스타일 정의
 */

import { CSSProperties } from 'react';

/**
 * 색상 팔레트
 */
export const COLORS = {
  primary: '#1a237e',
  secondary: '#1976d2',
  success: '#388e3c',
  warning: '#f57c00',
  error: '#d32f2f',
  info: '#0288d1',
  purple: '#7b1fa2',
  gray: {
    50: '#f5f5f5',
    100: '#e0e0e0',
    300: '#999',
    600: '#666',
    900: '#333',
  },
  white: '#fff',
  background: '#f5f5f5',
} as const;

/**
 * 그리드 레이아웃
 */
export const GRID_LAYOUTS = {
  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: 24,
  } as CSSProperties,
  
  info: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: 20,
  } as CSSProperties,
  
  categories: {
    display: 'flex',
    gap: 16,
    flexWrap: 'wrap' as const,
  } as CSSProperties,
} as const;

/**
 * 페이지 스타일
 */
export const PAGE_STYLES = {
  container: {
    padding: 40,
  } as CSSProperties,
  
  tabContainer: {
    display: 'flex',
    gap: 16,
    marginBottom: 30,
    borderBottom: '2px solid #e0e0e0',
  } as CSSProperties,
  
  subTabContainer: {
    display: 'flex',
    gap: 12,
    marginBottom: 30,
  } as CSSProperties,
} as const;
