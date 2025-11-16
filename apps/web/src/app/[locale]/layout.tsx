export async function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'es' }];
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  // For server components, we can await the params directly
  const { locale } = await params;
  
  // Ensure locale is valid, fallback to 'en'
  const validLocale = ['en', 'es'].includes(locale) ? locale : 'en';
  
  // Store locale in a way that client components can access it
  return (
    <div data-locale={validLocale}>
      {children}
    </div>
  );
}