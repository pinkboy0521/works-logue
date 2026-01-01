import { PrivateHeader } from "@/shared";

export default function PrivateLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <PrivateHeader />
      {children}
    </>
  );
}
