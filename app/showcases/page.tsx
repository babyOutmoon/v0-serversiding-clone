import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export const metadata = {
  title: "Showcases - Moon Server-Side",
  description: "Watch Moon Server-Side in action. See real gameplay showcases and demos.",
}

export default function ShowcasesPage() {
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-20">
        <section className="mx-auto max-w-5xl px-6">
          <div className="mb-12 text-center">
            <span className="mb-4 inline-block rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary">
              Showcases
            </span>
            <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              See It In Action
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
              Watch real gameplay footage of Moon Server-Side. See what our platform can do.
            </p>
          </div>

          <div className="relative mx-auto max-w-4xl">
            <div className="absolute -inset-4 rounded-2xl bg-primary/5 blur-2xl" />
            <div className="relative overflow-hidden rounded-xl border border-border/50 bg-card shadow-2xl shadow-primary/5">
              <div className="aspect-video w-full">
                <iframe
                  src="https://www.youtube.com/embed/9LhrfluqtQY"
                  title="Moon Server-Side Showcase"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="h-full w-full"
                />
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
