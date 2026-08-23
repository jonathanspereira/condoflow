import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Perfil Síndico",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
