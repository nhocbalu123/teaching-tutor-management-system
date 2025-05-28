import "@/shared/styles/globals.css";
import Header from "@/shared/components/layout/header/header";
import Footer from "@/shared/components/layout/footer/footer";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* <GlobalContextProvider> */}
        <Header />
        {children}
        <Footer />
        {/* </GlobalContextProvider> */}
      </body>
    </html>
  );
}
