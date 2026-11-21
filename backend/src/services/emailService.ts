import nodemailer, { Transporter } from 'nodemailer';
import { env } from '../config/env';
import { Logger } from '../utils/logger';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private static transporter: Transporter | null = null;

  private static getTransporter(): Transporter | null {
    if (!this.transporter && env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS) {
      this.transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_SECURE,
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS,
        },
      });
    }
    return this.transporter;
  }

  public static isConfigured(): boolean {
    return Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS);
  }

  public static async verifyConnection(): Promise<boolean> {
    if (!this.isConfigured()) {
      Logger.info('[EmailService] SMTP not fully configured; operating in secure local logging fallback mode.');
      return false;
    }
    try {
      const transporter = this.getTransporter();
      if (transporter) {
        await transporter.verify();
        Logger.info('[EmailService] SMTP transport verified successfully.');
        return true;
      }
      return false;
    } catch (err) {
      Logger.error('[EmailService] SMTP verification failed:', { error: (err as any)?.message });
      return false;
    }
  }

  public static async sendEmail(options: EmailOptions): Promise<boolean> {
    const fromAddress = env.FROM_EMAIL || env.SMTP_USER || 'notifications@franchisebridge.com';

    if (this.isConfigured()) {
      try {
        const transporter = this.getTransporter();
        if (transporter) {
          const info = await transporter.sendMail({
            from: `"FranchiseBridge Enterprise" <${fromAddress}>`,
            to: options.to,
            subject: options.subject,
            text: options.text || options.html.replace(/<[^>]+>/g, ''),
            html: options.html,
          });
          Logger.info(`[EmailService] Live email dispatched: ${info.messageId}`);
          return true;
        }
      } catch (err: any) {
        Logger.error('[EmailService] SMTP email dispatch failure:', {
          code: err?.code,
          command: err?.command,
          message: err?.message,
        });
        return false;
      }
    }

    if (env.isProduction) {
      Logger.error('[EmailService] Outbound email skipped: SMTP credentials are not configured in production.');
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
