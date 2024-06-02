import { Connection, Engine, ExecutionResult, Schema } from "@/types";
import postgres from "./postgres";

export interface Connector {
  testConnection: () => Promise<boolean>;
  execute: (databaseName: string, statement: string) => Promise<ExecutionResult>;
  getDatabases: () => Promise<string[]>;
  getTableSchema: (databaseName: string) => Promise<Schema[]>;
}

export const newConnector = (connection: Connection): Connector => {
  switch (connection.engineType) {
    case Engine.PostgreSQL:
      return postgres(connection);
    default:
      throw new Error("Unsupported engine type.");
  }
};
