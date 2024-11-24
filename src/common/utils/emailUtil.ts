import fs from "node:fs";
import path from "node:path";
import { env } from "@/common/configs/envConfig";
import { logger } from "@/server";
import nodemailer from "nodemailer";

export enum EEmailTemplate {
  ADMIN_NOTIFICATION = "admin-notification",
  USER_NOTIFICATION = "user-notification",
}

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
  sendAdminEmailNotification: async (templateName: EEmailTemplate, message: string) => {
    try {
      const subject = await getSubject(templateName);
      const html = await getEmailTemplate(templateName, message);

      const info = await transporter.sendMail({
        from: env.EMAIL_FROM,
        to: env.ADMIN_EMAIL,
        subject,
        html,
      });

      logger.info(`Email sent: ${info.messageId} to ADMIN: ${env.ADMIN_EMAIL}`);
    } catch (error) {
      console.log(error);
      logger.error("Error sending email notification to admin", error);
    }
  },
};
