'use client';

import Link from 'next/link';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faq = [
  {
    question: 'How do I report a bug?',
    answer:
      'Use the feedback form — it creates a labelled GitHub issue with your browser, page, and repro steps included. No GitHub account needed.',
  },
  {
    question: 'How do I request a feature?',
    answer: 'Same form, pick "Feature request". It lands as an enhancement-labelled issue.',
  },
  {
    question: 'How do I contact you directly?',
    answer:
      'Use the contact form. It is verified and rate-limited; messages go to the project inbox.',
  },
  {
    question: 'Why is there a puzzle before I can submit?',
    answer:
      'It is a proof-of-work challenge: your browser does a tiny computation to prove you are a real visitor. It stops bots and AI from flooding the forms while staying instant for humans.',
  },
  {
    question: 'What information gets collected?',
    answer:
      'The form fields you enter, your page URL, browser user agent, and the time. Issues are public when filed on a public repo — do not include secrets.',
  },
  {
    question: 'What if issue creation is disabled?',
    answer: 'The form still validates your input, then points you to the contact form instead.',
  },
];

/**
 * Help center: FAQ plus links to contact and feedback.
 *
 * @returns Help page with accessible FAQ accordion
 */
export default function HelpPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-2xl font-semibold">Help center</h1>
      <p className="mt-2 text-neutral-600">
        Quick answers, plus how to reach a human or file an issue.
      </p>
      <nav className="mt-4 flex gap-4">
        <Link className="text-blue-600 underline" href="/contact">
          Contact
        </Link>
        <Link className="text-blue-600 underline" href="/feedback">
          Report feedback
        </Link>
      </nav>
      <h2 className="mt-8 text-lg font-semibold">FAQ</h2>
      <Accordion type="multiple" className="mt-4">
        {faq.map((entry) => (
          <AccordionItem
            key={entry.question}
            value={entry.question}
            className="border-b border-neutral-200 first:border-t"
          >
            <AccordionTrigger>{entry.question}</AccordionTrigger>
            <AccordionContent>{entry.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </main>
  );
}
