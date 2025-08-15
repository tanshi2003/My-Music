// src/pages/_app.js
import Head from 'next/head';
import '../styles/globals.css';

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>My Music</title>
        <link rel="icon" href="/logo.jpg" type="image/jpg" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
