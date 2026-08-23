import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Esqueci a Senha",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
