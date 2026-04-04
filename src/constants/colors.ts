// src/constants/colors.ts
// Centralized color palette — eliminates hardcoded hex strings across the codebase

export const Colors = {
  brand: {
    50: '#eef2ff',
    100: '#e0e7ff',
    200: '#c7d2fe',
    300: '#a5b4fc',
    400: '#818cf8',
    500: '#6366f1',
    600: '#4f46e5',
    700: '#4338ca',
    800: '#3730a3',
    900: '#312e81',
  },
  slate: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617',
  },
  semantic: {
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },
  dark: {
    background: '#0f172a',
    surface: '#1e293b',
    surfaceElevated: '#334155',
    border: '#334155',
  },
  light: {
    background: '#f8fafc',
    surface: '#ffffff',
    surfaceElevated: '#ffffff',
    border: '#f1f5f9',
  },
} as const;

export type BrandColor = keyof typeof Colors.brand;
