export default function PublicLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      <>
        {/* <Navbar /> */}
        <main className="min-h-[80vh]">{children}</main>
        {/* <Footer /> */}
      </>
    );
  }