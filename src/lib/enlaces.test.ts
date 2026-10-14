import { describe, expect, it } from 'vitest';
import { completarUrl } from './enlaces.ts';

describe('completarUrl', () => {
  it('agrega https:// si el enlace no trae protocolo', () => {
    expect(completarUrl('meet.google.com/abc-defg-hij')).toBe('https://meet.google.com/abc-defg-hij');
  });

  it.each(['https://drive.google.com', 'http://moodle.u.edu.co', 'HTTPS://CLASSROOM.GOOGLE.COM'])('deja %s como está', (url) => {
    expect(completarUrl(url)).toBe(url);
  });
});
