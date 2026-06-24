import { useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { useStore } from './store';

/** Pull fresh data from the API every time the screen regains focus (real-time). */
export function useRefreshOnFocus() {
  const { refresh } = useStore();
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );
}
