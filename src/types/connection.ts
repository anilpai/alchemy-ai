import { Id } from ".";

export enum Engine {
  PostgreSQL = "POSTGRESQL",
}

export interface SSLOptions {
  ca?: string;
  cert?: string;
  key?: string;
  minVersion?: string;
  rejectUnauthorized?: boolean;
}

export interface Connection {
  id: Id;
  title: string;
  engineType: Engine;
  host: string;
  port: string;
  username: string;
  password: string;
  database?: string;
  ssl?: SSLOptions;
}
