declare namespace NodeJS {
  export interface ProcessEnv {
    // Required. Node environment.
    NODE_ENV: string;
    // Optional. Set to "true" to use the database. Need to use string as env is always string.
    // We can't prefix DATABASE_URL with NEXT_PUBLIC_ because it contains sensitive information that
    // should not be exposed to the client.
    NEXT_PUBLIC_USE_DATABASE: string;
    // Required if NEXT_PUBLIC_USE_DATABASE is true. Postgres database connection string to store
    // the data. e.g. postgresql://postgres:YOUR_PASSWORD@localhost:5432/northwind?schema=public
    DATABASE_URL: string;
    // Optional. Set to "true" to allow users to bring their own OpenAI API key.
    NEXT_PUBLIC_ALLOW_SELF_OPENAI_KEY: string;
    // Required. Do not share your OpenAI API key with anyone! It should remain a secret.
    OPENAI_API_KEY: string;
    // Optional.For users who belong to multiple organizations,
    // you can pass a header to specify which organization is used for an API request.
    // Usage from these API requests will count as usage for the specified organization.
    OPENAI_ORGANIZATION: string;
    // Optional. OpenAI API endpoint. Defaults to https://api.openai.com.
    OPENAI_API_ENDPOINT: string;
  }
}
