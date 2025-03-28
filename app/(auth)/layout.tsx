import Header from "../(landing)/components/header";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <Header />
      <div className="grid place-items-center mt-10">{children}</div>
    </div>
  );
}
