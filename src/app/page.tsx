import ColorDatePicker from '@/components/color-date-picker';

export default function Home() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center p-4 sm:p-8 md:p-12 lg:p-24 bg-background">
      <div className="w-full max-w-md">
        <header className="text-center mb-8">
          <h1 className="text-5xl font-bold tracking-tighter text-foreground">
            ChromaChron
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            The worst date picker imaginable.
          </p>
        </header>
        <ColorDatePicker />
      </div>
    </main>
  );
}
