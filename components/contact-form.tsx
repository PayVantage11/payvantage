"use client";

import { useState, type FormEvent, type ReactNode } from "react";

export function ContactForm(): ReactNode {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const subject = encodeURIComponent(
      `PayVantage contact form: ${name || "new message"}`,
    );
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\n\n${message}`,
    );
    window.location.href = `mailto:hwayner@vantagecapitalinsights.com?subject=${subject}&body=${body}`;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label
          htmlFor="contact-name"
          className="block text-xs font-medium uppercase tracking-wider text-foreground/40"
        >
          Name
        </label>
        <input
          id="contact-name"
          name="name"
          type="text"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="mt-2 block w-full rounded-md border border-foreground/15 bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-foreground/30 focus:border-foreground/50 focus:outline-none"
          placeholder="Jane Doe"
        />
      </div>
      <div>
        <label
          htmlFor="contact-email"
          className="block text-xs font-medium uppercase tracking-wider text-foreground/40"
        >
          Email
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mt-2 block w-full rounded-md border border-foreground/15 bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-foreground/30 focus:border-foreground/50 focus:outline-none"
          placeholder="jane@example.com"
        />
      </div>
      <div>
        <label
          htmlFor="contact-message"
          className="block text-xs font-medium uppercase tracking-wider text-foreground/40"
        >
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={6}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          className="mt-2 block w-full rounded-md border border-foreground/15 bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-foreground/30 focus:border-foreground/50 focus:outline-none"
          placeholder="Tell us about your business — vertical, monthly volume, and what you need."
        />
      </div>
      <button
        type="submit"
        className="inline-flex h-11 items-center justify-center rounded-full bg-foreground px-6 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
      >
        Send message
      </button>
    </form>
  );
}
