import fs from "node:fs";
import path from "node:path";
import { env } from "@/common/configs/envConfig";
import { logger } from "@/server";
import nodemailer from "nodemailer";

export enum EEmailTemplate {
  ADMIN_NOTIFICATION = "admin-notification",
  USER_NOTIFICATION = "user-notification",
}

// supported email attachments
export enum EEmailAttchments {
  CSV = "text/csv",
  TEXT = "text/plain",
}

export type TEmailAttachment = {
  filename: string;
  content: string;
  contentType: EEmailAttchments;
};

const transporter = nodemailer.createTransport({
  host: env.EMAIL_HOST,
  port: env.EMAIL_PORT,
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS,
  },
});

const getEmailTemplate = async (templateName: EEmailTemplate, message: string): Promise<string> => {
  const basePath = env.EMAIL_TEMPLATES_PATH;
  let templatePath: string;

  //   get email template path
  switch (templateName) {
    case EEmailTemplate.ADMIN_NOTIFICATION:
      templatePath = path.join(basePath, "/adminEmail.html");
      break;
    default:
      throw new Error("Not Implemented Template");
  }

  const emailTemplate = fs.readFileSync(templatePath, "utf-8");
  return emailTemplate.replace("{{message}}", message);
};

const getSubject = (templateName: EEmailTemplate): string => {
  switch (templateName) {
    case EEmailTemplate.ADMIN_NOTIFICATION:
      return "Admin Notification";
    default:
      throw new Error("Not Implemented Template");
  }
};

export const emailUtil = {
  // for normal email notifications
  sendAdminEmailNotification: async (message: string, attachments?: TEmailAttachment[]) => {
    try {
      const subject = await getSubject(EEmailTemplate.ADMIN_NOTIFICATION);
      const html = await getEmailTemplate(EEmailTemplate.ADMIN_NOTIFICATION, message);

      const info = await transporter.sendMail({
        from: env.EMAIL_FROM,
        to: env.ADMIN_EMAIL,
        subject,
        html,
        ...(attachments && { attachments }),
      });

      // logger.info(`Email sent: ${info.messageId} to ADMIN: ${env.ADMIN_EMAIL}`);
    } catch (error) {
      console.log(error);
      logger.error("Error sending email notification to admin", error);
    }
  },
};
