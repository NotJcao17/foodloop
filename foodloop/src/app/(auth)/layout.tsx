export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-3">
            <span className="text-3xl">🌿</span>
          </div>
          <h1 className="text-2xl font-bold text-text">FoodLoop</h1>
          <p className="text-sm text-muted mt-1">Comparte alimentos, reduce el desperdicio</p>
        </div>
        {children}
      </div>
    </div>
  );
}
