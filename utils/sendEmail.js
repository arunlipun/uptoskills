
import { sendEmail as sendEmailService } from '../services/emailService.js';

export const sendEmail = async (options) => {
  return sendEmailService(options.to, options.subject, options.text);
};