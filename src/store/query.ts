import { merge } from "lodash-es";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Connection, Database, Id, Timestamp } from "@/types";

interface ExecuteQueryContext {
  connection: Connection;
  database?: Database;
  messageId?: Id;
  statement: string;
}

interface QueryHistory {
  context: ExecuteQueryContext;
  createdAt: Timestamp;
}

interface QueryState {
  queryHistory: QueryHistory[];
  context?: ExecuteQueryContext;
  setContext: (context: ExecuteQueryContext | undefined) => void;
}

export const useQueryStore = create<QueryState>()(
  persist(
    (set) => ({
      queryHistory: [],
      setContext: (context) => {
        set((state) => ({
          ...state,
          context,
        }));
      },
    }),
    {
      name: "query-storage",
      merge: (persistedState, currentState) => {
        return {
          ...merge(currentState, persistedState),
          context: undefined,
        };
      },
    }
  )
);
