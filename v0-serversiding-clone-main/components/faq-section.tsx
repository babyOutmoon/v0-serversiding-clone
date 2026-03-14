"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
  {
    question: "What is this?",
    answer: "moon serverside is a serversided ROBLOX in-game interface allowing you to do anything you want in our supported games. We are one of the largest internal serverside in the market, with the best selection of supported games.",
  },
  {
    question: "How does this work?",
    answer: "Simple. There is no download required to use moon serverside. Our software is fully internal, and automatically loads in any game supported. We bypass filtering enabled, and this is not a traditional cheat/exploit, it is similar to being given access to admin in a game, and we work without breaking Roblox's terms of service.",
  },
  {
    question: "How do I purchase this?",
    answer: "Please visit our pricing page and go on the purchase section to purchase this.",
  },
  {
    question: "Does Byfron affect this?",
    answer: "No, we are not affected by the new Byfron Update. We don't tamper with roblox processes, we simply have built the system into the game itself, meaning updates won't affect our service. We aim for providing the best experience for our customers, and we will never put them at risk in any sort of way.",
  },
  {
    question: "Is this against ROBLOX TOS?",
    answer: "Nope! moon server-side is designed with safety in mind. You will not get banned from any platforms for using this product, and you can use it in any game we support! All script execution is done in a secure environment.",
  },
  {
    question: "Is this illegal?",
    answer: "No, like mentioned earlier, all of the games supported by moon server-side are games we collaborated with. This means that you can use moon server-side without worrying about getting in any trouble.",
  },
]

export function FaqSection() {
  return (
    <section id="faq" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-3xl px-6">
        {/* Section header */}
        <div className="text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 backdrop-blur-sm">
            <span className="text-xs font-semibold tracking-wide text-primary uppercase">Support</span>
          </div>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl">
            Frequently Asked <span className="gradient-text">Questions</span>
          </h2>
        </div>

        {/* Accordion */}
        <div className="mt-16">
          <Accordion type="single" collapsible className="flex flex-col gap-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="group overflow-hidden rounded-xl glass px-6 transition-all duration-300 data-[state=open]:shadow-lg data-[state=open]:shadow-primary/5"
              >
                {/* Left gradient bar on open */}
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary to-accent opacity-0 transition-opacity data-[state=open]:opacity-100 group-data-[state=open]:opacity-100" />
                <AccordionTrigger className="text-left text-base font-semibold text-foreground hover:no-underline py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
