"use client"
import { Header } from "@/components/layouts/Header";
import { Footer } from "@/components/layouts/Footer";
import { NextUIProvider } from "@nextui-org/react";

export const Providers = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {

  return (
    <NextUIProvider>
      <Header></Header>
        <div className="text-center">
          {children}
        </div>
      <Footer></Footer>
    </NextUIProvider>
  );
}