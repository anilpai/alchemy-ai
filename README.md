
# Alchemy AI

![Vercel Deploy](https://deploy-badge.vercel.app/vercel/alchemy-ai-jet)

English | [Kannada](README.kn.md)
</div>

## Product Tour



https://github.com/anilpai/alchemy-ai/assets/2447811/aeb14ee9-bf9b-4461-b962-a4f481dd741c



## What

Introducing Alchemy AI, a revolutionary SQL client that transforms the way you interact with your database. Leveraging the power of natural language processing, Alchemy AI allows you to perform database operations such as querying, modifying, adding, and deleting data, all through intuitive chat-based communication. It's a seamless blend of advanced technology and user-friendly design, making database management more accessible and efficient than ever before.

## Why

Experience the future of data tools with Alchemy AI! We're leveraging the power of AI to revolutionize the way you interact with your data. Say goodbye to navigating through complex UI controls. With our intuitive chat-based interface, you can access and manage your data effortlessly. Don't miss out on this opportunity to transform your data management experience with Alchemy AI!

## How

Alchemy AI, a product built using Next.js, currently supports PostgreSQL databases. We are continuously expanding our capabilities and plan to include more databases in the future. Stay tuned for updates!

## Architecture

[View on Eraser![](https://app.eraser.io/workspace/6d7Oh8I8idREdZCiyqqN/preview?elements=OcrXkUXnOoTc6GDeTroZVg&type=embed)](https://app.eraser.io/workspace/6d7Oh8I8idREdZCiyqqN?elements=OcrXkUXnOoTc6GDeTroZVg)

### OpenAI related

- `OPENAI_API_KEY`: OpenAI API key. You can get one from [here](https://platform.openai.com/api-keys).

- `OPENAI_API_ENDPOINT`: OpenAI API endpoint. Defaults to `https://api.openai.com`.

- `NEXT_PUBLIC_ALLOW_SELF_OPENAI_KEY`: Set to `true` to allow users to bring their own OpenAI API key.

## Local Development

1. Install dependencies

   ```bash
   pnpm i
   ```

2. Make a copy of the example environment variables file:

   ```bash
   cp .env.nodb .env
   ```

Please make sure you have a stable network connection which can access the OpenAI API endpoint.

```bash
ping api.openai.com
```

If you cannot access the OpenAI API endpoint, you can try to set the `OPENAI_API_ENDPOINT` in UI or environment variable.

To load data, follow this link: <https://github.com/pthom/northwind_psql/blob/master/northwind.sql>

For Northwind queries, please refer to the attached PDF.
