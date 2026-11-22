import { Resend } from 'resend';
import { env } from '../config/env';
import { Logger } from '../utils/logger';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private static resendClient: Resend | null = null;

  public static getResendClient(): Resend | null {
    if (!this.resendClient && env.RESEND_API_KEY) {
      this.resendClient = new Resend(env.RESEND_API_KEY);
    }
    return this.resendClient;
  }

  public static isConfigured(): boolean {
    return Boolean(env.RESEND_API_KEY);
  }

  public static async verifyConnection(): Promise<boolean> {
    if (!this.isConfigured()) {
      Logger.info('[EmailService] Resend API key not configured; operating in local dev/test mock mode.');
      return false;
    }
    Logger.info('[EmailService] Resend API provider initialized with configured API key.');
    return true;
  }

  public static async sendEmail(options: EmailOptions): Promise<boolean> {
    const rawFrom = env.FROM_EMAIL || 'onboarding@resend.dev';
    const fromAddress = rawFrom.includes('<') ? rawFrom : `FranchiseBridge <${rawFrom}>`;

    if (env.RESEND_API_KEY) {
      try {
        const resend = this.getResendClient();
        if (!resend) {
          Logger.error('[EmailService] Resend client initialization failed.');
          return false;
        }

        // 10-second timeout to prevent leaving requests hanging
        const timeoutMs = 10000;
        let timeoutId: NodeJS.Timeout;

        const sendPromise = resend.emails.send({
          from: fromAddress,
          to: options.to,
          subject: options.subject,
          html: options.html,
          text: options.text || options.html.replace(/<[^>]+>/g, ''),
        });

        const timeoutPromise = new Promise<never>((_, reject) => {
          timeoutId = setTimeout(() => {
            reject(new Error('Resend email dispatch timed out after 10 seconds'));
          }, timeoutMs);
        });

        try {
          const response: any = await Promise.race([sendPromise, timeoutPromise]);
          clearTimeout(timeoutId!);

          if (response?.error) {
            Logger.error('[EmailService] Resend API rejected email dispatch:', {
              name: response.error?.name,
              message: response.error?.message,
            });
            return false;
          }

          if (response?.data?.id) {
            Logger.info(`[EmailService] Live email accepted by Resend API: ${response.data.id}`);
            return true;
          }

          Logger.error('[EmailService] Resend API returned unexpected response without message ID.');
          return false;
        } catch (raceErr) {
          clearTimeout(timeoutId!);
          throw raceErr;
        }
      } catch (err: any) {
        Logger.error('[EmailService] Resend dispatch exception:', {
          name: err?.name,
          message: err?.message,
        });
        return false;
      }
    }

    if (env.isProduction) {
      Logger.error('[EmailService] Outbound email skipped: RESEND_API_KEY is not configured in production.');
      return false;
    }

    // Development / test fallback logging mode (does not expose sensitive tokens or credentials)
    Logger.info(`[EmailService - DEV/TEST MOCK] Email simulated to: ${options.to} | Subject: ${options.subject}`);
    return true;
  }

  public static async sendPasswordResetEmail(to: string, resetUrl: string): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: 'FranchiseBridge - Password Reset Request',
      text: `FranchiseBridge Password Recovery Request\n\nWe received a request to reset the password for your FranchiseBridge account. Use the link below within 1 hour to create a new password:\n\n${resetUrl}\n\nThis link is single-use and expires in 1 hour. If you did not request this, please ignore this email. Your account remains secure.`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password - FranchiseBridge</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
          <div style="max-width: 600px; margin: 40px auto; background-color: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
            <div style="background-color: #14243A; padding: 24px 32px; text-align: left;">
              <span style="font-size: 22px; font-weight: 700; color: #FFFFFF; letter-spacing: -0.5px;">
                Franchise<span style="color: #3563FF;">Bridge</span>
              </span>
              <span style="display: block; font-size: 11px; color: #94A3B8; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px; font-weight: 600;">
                Enterprise Brokerage Platform
              </span>
            </div>
            <div style="padding: 32px;">
              <h1 style="color: #0F172A; font-size: 20px; font-weight: 700; margin: 0 0 16px 0;">
                Password Recovery Request
              </h1>
              <p style="color: #475569; font-size: 14px; line-height: 24px; margin: 0 0 20px 0;">
                We received a request to reset the password for your FranchiseBridge account. Click the button below to establish a new password:
              </p>
              <div style="margin: 28px 0; text-align: center;">
                <a href="${resetUrl}" style="background-color: #3563FF; color: #FFFFFF; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; display: inline-block; box-shadow: 0 2px 4px rgba(53, 99, 255, 0.2);">
                  Reset My Password
                </a>
              </div>
              <div style="background-color: #F1F5F9; border-left: 4px solid #3563FF; padding: 12px 16px; border-radius: 4px; margin: 24px 0;">
                <p style="color: #334155; font-size: 13px; line-height: 20px; margin: 0; font-weight: 500;">
                  <strong>Security Notice:</strong> This password reset link is valid for <strong>1 hour</strong> and can only be used once.
                </p>
              </div>
              <p style="color: #64748B; font-size: 13px; line-height: 20px; margin: 20px 0 0 0;">
                If you did not request a password reset, you can safely ignore this email. Your password will not change and your account remains protected.
              </p>
              <div style="margin-top: 28px; padding-top: 20px; border-top: 1px solid #E2E8F0;">
                <p style="color: #94A3B8; font-size: 11px; line-height: 18px; margin: 0;">
                  If the button above does not work, copy and paste this link into your browser:<br>
                  <a href="${resetUrl}" style="color: #3563FF; word-break: break-all;">${resetUrl}</a>
                </p>
              </div>
            </div>
            <div style="background-color: #F8FAFC; padding: 16px 32px; border-top: 1px solid #E2E8F0; text-align: center;">
              <p style="color: #94A3B8; font-size: 11px; margin: 0;">
                &copy; FranchiseBridge Enterprise Platform. Confidential &amp; Proprietary.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
  }

  public static async sendVerificationEmail(to: string, verifyUrl: string): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: 'FranchiseBridge - Verify Your Account',
      text: `Please verify your FranchiseBridge account by visiting: ${verifyUrl}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; padding: 32px 24px; border: 1px solid #E2E8F0; border-radius: 12px; background-color: #FFFFFF;">
          <div style="margin-bottom: 24px;">
            <span style="font-size: 20px; font-weight: bold; color: #1E293B;">Franchise<span style="color: #2563EB;">Bridge</span></span>
          </div>
          <h2 style="color: #0F172A; font-size: 22px; margin-bottom: 16px;">Verify Your Email Address</h2>
          <p style="color: #475569; font-size: 15px; line-height: 24px;">Welcome to FranchiseBridge. To activate your full brokerage and deal room capabilities, please verify your email address.</p>
          <div style="margin: 28px 0;">
            <a href="${verifyUrl}" style="background-color: #2563EB; color: #FFFFFF; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; display: inline-block;">Verify Email</a>
          </div>
        </div>
      `,
    });
  }

  public static async sendEnquiryNotification(
    to: string,
    investorName: string,
    brandName: string,
    city: string,
    budget: string
  ): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: `New Franchise Inquiry for ${brandName} from ${investorName}`,
      text: `A new verified investor application has been submitted by ${investorName} for territory: ${city} with capital: ${budget}.`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; padding: 32px 24px; border: 1px solid #E2E8F0; border-radius: 12px; background-color: #FFFFFF;">
          <h2 style="color: #0F172A; font-size: 20px; margin-bottom: 12px;">New Franchise Inquiry</h2>
          <p style="color: #475569; font-size: 15px; line-height: 24px;">A new prospective franchisee inquiry has been submitted for <strong>${brandName}</strong>.</p>
          <div style="background-color: #F8FAFC; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <p style="margin: 6px 0; color: #1E293B; font-size: 14px;"><strong>Candidate:</strong> ${investorName}</p>
            <p style="margin: 6px 0; color: #1E293B; font-size: 14px;"><strong>Target City:</strong> ${city}</p>
            <p style="margin: 6px 0; color: #1E293B; font-size: 14px;"><strong>Investment Budget:</strong> ${budget}</p>
          </div>
          <p style="color: #64748B; font-size: 13px;">Manage this candidate via your assigned FranchiseBridge CRM deal pipeline.</p>
        </div>
      `,
    });
  }

  public static async sendListingApprovedNotification(to: string, brandName: string): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: `Franchise Opportunity Approved: ${brandName}`,
      text: `Congratulations! Your franchise opportunity for ${brandName} has been verified and published to the marketplace.`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; padding: 32px 24px; border: 1px solid #E2E8F0; border-radius: 12px; background-color: #FFFFFF;">
          <h2 style="color: #059669; font-size: 20px; margin-bottom: 12px;">Franchise Opportunity Approved</h2>
          <p style="color: #475569; font-size: 15px; line-height: 24px;">Your listing for <strong>${brandName}</strong> has been approved by the brokerage compliance team and is now actively published on the marketplace.</p>
        </div>
      `,
    });
  }

  public static async sendCommissionNotification(
    to: string,
    agreementNumber: string,
    milestoneName: string,
    amountFormatted: string,
    dueDateFormatted: string
  ): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: `Brokerage Commission Invoice Due: ${agreementNumber}`,
      text: `Commission milestone "${milestoneName}" of ${amountFormatted} under agreement ${agreementNumber} is scheduled for payment on ${dueDateFormatted}.`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; padding: 32px 24px; border: 1px solid #E2E8F0; border-radius: 12px; background-color: #FFFFFF;">
          <h2 style="color: #0F172A; font-size: 20px; margin-bottom: 12px;">Commission Milestone Notice</h2>
          <p style="color: #475569; font-size: 15px; line-height: 24px;">This is a scheduled reminder for an upcoming or pending commission payment milestone.</p>
          <div style="background-color: #F8FAFC; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <p style="margin: 6px 0; color: #1E293B; font-size: 14px;"><strong>Agreement:</strong> ${agreementNumber}</p>
            <p style="margin: 6px 0; color: #1E293B; font-size: 14px;"><strong>Milestone:</strong> ${milestoneName}</p>
            <p style="margin: 6px 0; color: #1E293B; font-size: 14px;"><strong>Amount Due:</strong> ${amountFormatted}</p>
            <p style="margin: 6px 0; color: #1E293B; font-size: 14px;"><strong>Due Date:</strong> ${dueDateFormatted}</p>
          </div>
        </div>
      `,
    });
  }
}
