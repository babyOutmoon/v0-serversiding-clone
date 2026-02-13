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
    answer: "Serversiding.xyz is a serversided ROBLOX web-panel interface allowing you to do anything you want in our supported games. We are one of the largest web based serverside in the market, with the best selection of supported games.",
  },
  {
    question: "How does this work?",
    answer: "Simple. There is no download required to use serversiding.xyz. Our software is fully internal, and automatically loads in any game supported. We bypass filtering enabled, and this is not a traditional cheat/exploit, it is similar to being given access to admin in a game, and we work without breaking Roblox's terms of service.",
  },
  {
    question: "How do I purchase this?",
    answer: "Please visit our pricing page and go on the purchase section to purchase this.",
  },
  {
    question: "Does Byfron affect this?",
    answer: "Due to our technology, we are not affected by the new Byfron Update. We don't tamper with roblox processes, we simply have built the system into the game itself, meaning updates won't affect our service. We aim for providing the best experience for our customers, and we will never put them at risk in any sort of way.",
  },
  {
    question: "Is this against ROBLOX TOS?",
    answer: "Nope! serversiding.xyz is designed with safety in mind. You will not get banned from any platforms for using this product, and you can use it in any game we support! All script execution is done in a secure environment.",
  },
  {
    question: "Is this illegal?",
    answer: "No, like mentioned earlier, all of the games supported by serversiding.xyz are games we collaborated with. This means that you can use serversiding.xyz without worrying about getting in any trouble.",
  },
]

export function FaqSection() {
  return (
    <section id="faq" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-3xl px-6">
        {/* Section header */}
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Support</p>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Frequently Asked Questions
          </h2>
        </div>

        {/* Accordion */}
        <div className="mt-16">
          <Accordion type="single" collapsible className="flex flex-col gap-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="overflow-hidden rounded-xl border border-border/50 bg-card px-6 data-[state=open]:border-primary/30"
              >
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
