import { randomUUID } from 'node:crypto';

export const generateOrderCode = (): string => {
  const suffix = randomUUID().split('-')[0].toUpperCase();
  return `AC-${suffix}`;
};
