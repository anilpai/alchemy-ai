import { NextPage } from "next";
import Head from "next/head";
import dynamic from "next/dynamic";
import React from "react";

// Dynamic imports for components to avoid hydration on server side rendering (SSR)
const ConnectionSidebar = dynamic(() => import("@/components/ConnectionSidebar"), {
  ssr: false,
});
const ConversationView = dynamic(() => import("@/components/ConversationView"), {
  ssr: false,
});
const QueryEditor = dynamic(() => import("@/components/QueryEditor"), {
  ssr: false,
});

// The main page component
const IndexPage: NextPage = () => {
  return (
    <div>
      {/* Setting up the head elements for SEO */}
      <Head>
        <title>Alchemist AI - Chat-based SQL Client and Editor for the future</title>
        <meta name="description" content="Chat-based SQL Client and Editor for the future" />
        <meta name="og:title" property="og:title" content="Alchemist AI" />
        <meta name="og:description" property="og:description" content="Chat-based SQL Client and Editor for the future" />
        <meta name="og:type" property="og:type" content="website" />
        <meta name="og:url" property="og:url" content="https://www.Alchemist.ai" />
      </Head>

      {/* Hidden heading for screen readers */}
      <h1 className="sr-only">Ask SQL</h1>

      {/* Main layout with ConnectionSidebar, QueryEditor, and ConversationView */}
      <main className="flex flex-row w-full h-full dark:bg-zinc-800">
        <ConnectionSidebar />
        <div className="flex flex-col w-full h-full dark:bg-zinc-800">
          <QueryEditor />
          <ConversationView />
        </div>
      </main>
    </div>
  );
};

// Export the main page component
export default IndexPage;
