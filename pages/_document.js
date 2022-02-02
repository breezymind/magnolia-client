import Document, { Html, Head, Main, NextScript } from "next/document";

export default class MyDocument extends Document {

  render() {
    return (
      <Html>
          <title>Magnolia</title>
        <Head>
          <meta charSet="utf-8"></meta>
          <body>
            <Main />
            <NextScript />
          </body>
        </Head>
      </Html>
    );
  }
}