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
    const fromAddress = env.FROM_EMAIL || 'notifications@franchisebridge.com';

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
          Logger.info(`[EmailService] Live email dispatched: ${info.messageId} to ${options.to}`);
          return true;
        }
      } catch (err: any) {
        Logger.error('[EmailService] SMTP dispatch failure, falling back to log:', { error: err.message, to: options.to });
        // Fallback to avoid failing user requests when SMTP server is down
      }
    }

    // Development / fallback logging mode
    Logger.info(`[EmailService - LOGGED] To: ${options.to} | Subject: ${options.subject}`);
    return true;
  }

  public static async sendPasswordResetEmail(to: string, resetUrl: string): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: 'FranchiseBridge - Password Reset Request',
      text: `You have requested to reset your password. Use the following link within 1 hour: ${resetUrl}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; padding: 32px 24px; border: 1px solid #E2E8F0; border-radius: 12px; background-color: #FFFFFF;">
          <div style="margin-bottom: 24px;">
            <span style="font-size: 20px; font-weight: bold; color: #1E293B;">Franchise<span style="color: #2563EB;">Bridge</span></span>
          </div>
          <h2 style="color: #0F172A; font-size: 22px; margin-bottom: 16px;">Reset Your Password</h2>
          <p style="color: #475569; font-size: 15px; line-height: 24px;">You received this email because you requested a password reset for your FranchiseBridge Enterprise account.</p>
          <div style="margin: 28px 0;">
            <a href="${resetUrl}" style="background-color: #2563EB; color: #FFFFFF; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; display: inline-block;">Reset Password</a>
          </div>
          <p style="color: #64748B; font-size: 13px; line-height: 20px;">This link is valid for 1 hour. If you did not request this change, please ignore this email or contact support immediately.</p>
        </div>
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
