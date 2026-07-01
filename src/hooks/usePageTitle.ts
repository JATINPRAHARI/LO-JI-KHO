import { useEffect } from 'react';

const BASE = 'Lo Ji Khao';

export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} | ${BASE}` : `${BASE} | Good Food, Good Mood`;
  }, [title]);
}
