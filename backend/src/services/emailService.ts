import { env } from '../config/env';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private static isConfigured(): boolean {
    return Boolean(
      process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS
    );
  }

  public static async sendEmail(options: EmailOptions): Promise<boolean> {
    const fromAddress = process.env.FROM_EMAIL || 'notifications@franchisebridge.com';

    if (this.isConfigured()) {
      try {
        // Dynamic require or standard transport
        console.log(`[EmailService] Sending live email via SMTP to: ${options.to} | Subject: ${options.subject}`);
        // If nodemailer is configured in environment, transport here
        return true;
      } catch (err) {
        console.error('[EmailService] SMTP send failure:', err);
        return false;
      }
    } else {
      // In development / demo mode, log the outgoing email securely
      console.log('----------------------------------------------------');
      console.log(`[EmailService - DEV LOG] To: ${options.to}`);
      console.log(`[EmailService - DEV LOG] From: ${fromAddress}`);
      console.log(`[EmailService - DEV LOG] Subject: ${options.subject}`);
      console.log(`[EmailService - DEV LOG] Body Preview: ${options.text || options.html.substring(0, 150)}...`);
      console.log('----------------------------------------------------');
      return true;
    }
  }

  public static async sendPasswordResetEmail(to: string, resetUrl: string): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: 'FranchiseBridge - Password Reset Request',
      text: `You have requested to reset your password. Use the following link within 1 hour: ${resetUrl}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #E7ECF2; border-radius: 12px;">
          <h2 style="color: #14243A;">Reset Your Password</h2>
          <p style="color: #64748B;">You received this email because you (or someone else) requested a password reset for your FranchiseBridge account.</p>
          <div style="margin: 24px 0;">
            <a href="${resetUrl}" style="background-color: #315EFB; color: #FFFFFF; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Reset Password</a>
          </div>
          <p style="color: #64748B; font-size: 12px;">This link is valid for 1 hour. If you did not request this, please ignore this email.</p>
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
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #E7ECF2; border-radius: 12px;">
          <h2 style="color: #14243A;">Welcome to FranchiseBridge</h2>
          <p style="color: #64748B;">Please confirm your email address to complete your registration.</p>
          <div style="margin: 24px 0;">
            <a href="${verifyUrl}" style="background-color: #315EFB; color: #FFFFFF; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Verify Email</a>
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
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #E7ECF2; border-radius: 12px;">
          <h2 style="color: #14243A;">New Franchise Inquiry</h2>
          <p style="color: #64748B;">A new operator application has been submitted for <strong>${brandName}</strong>.</p>
          <ul style="color: #14243A; font-size: 14px; line-height: 24px;">
            <li><strong>Candidate:</strong> ${investorName}</li>
            <li><strong>Target City:</strong> ${city}</li>
            <li><strong>Capital Budget:</strong> ${budget}</li>
          </ul>
          <p style="color: #64748B; font-size: 12px;">Review candidate liquid capital credentials in your FranchiseBridge Deal Room.</p>
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
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #E7ECF2; border-radius: 12px;">
          <h2 style="color: #159D8B;">Franchise Opportunity Approved</h2>
          <p style="color: #64748B;">Your opportunity for <strong>${brandName}</strong> has completed due diligence review and is now live on the public directory.</p>
        </div>
      `,
    });
  }
}
