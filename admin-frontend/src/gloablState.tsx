import React, { createContext, useContext, useReducer } from 'react';

export enum ActionType {
  SET_VOTE_STATE = 'SET_VOTE_STATE',
  SET_VOTE_QUESTION = 'SET_VOTE_QUESTION',
  RESET = 'RESET'
}

interface State {
  voteState: string;
  voteQuestion: string;
}

interface Action {
  type: ActionType;
  payload: string;
}

const initialState: State = {
  voteState: 'PRE_VOTING',
  voteQuestion: ''
};

export const reducer: React.Reducer<State, Action> = (state: State, action: Action): State => {
  switch (action.type) {
    case ActionType.SET_VOTE_STATE:
      return {
        ...state,
        voteState: action.payload
      };
    case ActionType.SET_VOTE_QUESTION:
      return {
        ...state,
        voteQuestion: action.payload
      };
    case ActionType.RESET:
      return {
        ...state,
        voteState: 'PRE_VOTING',
        voteQuestion: ''
      };
    default:
      return state;
  }
};

const stateContext = createContext<State>(initialState);
const dispatchContext = createContext((() => 0) as React.Dispatch<Action>);

export const StateProvider: React.FC = ({ children }) => {
  const [state, dispatch] = useReducer<React.Reducer<State, Action>>(reducer, initialState);

  return (
    <dispatchContext.Provider value={dispatch}>
      <stateContext.Provider value={state}>{children}</stateContext.Provider>
    </dispatchContext.Provider>
  );
};

export const useDispatch = () => {
  return useContext(dispatchContext);
};

export const useGlobalState = <K extends keyof State>(property: K) => {
  const state = useContext<State>(stateContext);
  return state[property]; // only one depth selector for comparison
};
