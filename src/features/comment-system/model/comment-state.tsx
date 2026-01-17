"use client";

import {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  Dispatch,
} from "react";

interface CommentState {
  replyingTo: string | null;
  isSubmitting: boolean;
}

type CommentAction =
  | { type: "SET_REPLYING_TO"; commentId: string | null }
  | { type: "SET_SUBMITTING"; submitting: boolean };

const initialState: CommentState = {
  replyingTo: null,
  isSubmitting: false,
};

function commentReducer(
  state: CommentState,
  action: CommentAction,
): CommentState {
  switch (action.type) {
    case "SET_REPLYING_TO":
      return { ...state, replyingTo: action.commentId };
    case "SET_SUBMITTING":
      return { ...state, isSubmitting: action.submitting };
    default:
      return state;
  }
}

interface CommentContextType {
  state: CommentState;
  dispatch: Dispatch<CommentAction>;
}

const CommentContext = createContext<CommentContextType | null>(null);

export function CommentProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(commentReducer, initialState);

  return (
    <CommentContext.Provider value={{ state, dispatch }}>
      {children}
    </CommentContext.Provider>
  );
}

export function useCommentState() {
  const context = useContext(CommentContext);
  if (!context) {
    throw new Error("useCommentState must be used within a CommentProvider");
  }
  return context;
}
