import { createLogger } from "@rpos/logger";

export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
}

export interface Mailer {
  send(message: EmailMessage): Promise<void>;
}

/**
 * Development mailer: logs the message instead of delivering it.
 * Swap for an SMTP/SES implementation in production.
 */
export class ConsoleMailer implements Mailer {
  private readonly log = createLogger("mailer");

  async send(message: EmailMessage): Promise<void> {
    this.log.info(
      { to: message.to, subject: message.subject, text: message.text },
      "email delivered (console mailer)",
    );
  }
}
