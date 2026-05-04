import React, { createContext, useContext, useEffect, useReducer } from "react";
import { Church, fetchChurches, createChurch, updateChurch, deleteChurch } from "../services/churchAPI";

type State = {
  churches: Church[];
};

type Action =
  | { type: "SET"; payload: Church[] }
  | { type: "ADD"; payload: Church }
  | { type: "UPDATE"; payload: Church }
  | { type: "DELETE"; payload: string };

const initialState: State = { churches: [] };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET":
      return { churches: action.payload };
    case "ADD":
      return { churches: [...state.churches, action.payload] };
    case "UPDATE":
      return {
        churches: state.churches.map((c) =>
          c.id === action.payload.id ? action.payload : c
        ),
      };
    case "DELETE":
      return {
        churches: state.churches.filter((c) => c.id !== action.payload),
      };
    default:
      return state;
  }
}

const ChurchContext = createContext<{
  state: State;
  dispatch: React.Dispatch<Action>;
}>({
  state: initialState,
  dispatch: () => null,
});

export const ChurchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Load initial data once
  useEffect(() => {
    async function load() {
      const data = await fetchChurches();
      dispatch({ type: "SET", payload: data });
    }
    load();
  }, []);

  return (
    <ChurchContext.Provider value={{ state, dispatch }}>
      {children}
    </ChurchContext.Provider>
  );
};

export const useChurch = () => useContext(ChurchContext);