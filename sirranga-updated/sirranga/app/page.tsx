import { PageTransition } from "@/components/page-transition"

export default function HomePage() {
  return (
    <PageTransition>
      <main className="min-h-screen flex flex-col items-center justify-start px-6 py-20">
        <section className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-sans text-foreground text-center text-balance leading-tight">
            SirRangas
          </h1>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-sans text-orange text-center text-balance">
            Official Website
          </h2>
          <div className="w-full max-w-2xl mt-8">
            <iframe
              id="kofiframe"
              src="https://ko-fi.com/sirranga/?hidefeed=true&widget=true&embed=true&preview=true"
              style={{ border: "none", width: "100%", padding: "4px", background: "#f9f9f9" }}
              height="712"
              title="sirranga"
            />
          </div>
        </section>
      </main>
    </PageTransition>
  )
}
