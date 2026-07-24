import { useReducer, useCallback } from 'react';
import type { ScenarioId } from './types';
import { reducer, initialState } from './reducer';

export function useEnhancedIndexStore() {
  const [state, dispatch] = useReducer(reducer, undefined, () => initialState('happy'));
  const selectScenario = useCallback((id: ScenarioId) => dispatch({ type: 'SELECT_SCENARIO', id }), []);
  const open = useCallback(() => dispatch({ type: 'OPEN' }), []);
  return { state, dispatch, selectScenario, open };
}
export type Store = ReturnType<typeof useEnhancedIndexStore>;
