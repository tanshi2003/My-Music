// src/pages/_app.js
import Head from 'next/head';
import '../styles/globals.css';
import React from "react";
import { PlayerProvider } from "../context/PlayerContext";
import PlayerBar from "../components/PlayerBar";

export default function MyApp({ Component, pageProps }) {
  return (
    <PlayerProvider>
      <>
        <Head>
          <title>Cutie.fy</title>
          <link rel="icon" href="/logo.jpg" type="image/jpg" />
        </Head>
        <Component {...pageProps} />
        <PlayerBar />
      </>
    </PlayerProvider>
  );
}
