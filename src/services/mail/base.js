const model = require("@schemas/model");
const Mail = require("@models/Mail");
const Vip = require("@models/Vip");
const MailStatuses = require("@constants/MailStatuses");

/**
 * Sends a mail to a user or globally.
 * @param {Object} options
 * @param {number} [options.userId=0] - Target user ID (0 = global mail)
 * @param {string} options.title - Mail title
 * @param {string} options.content - Mail content
 * @param {Array} [options.attachment=[]] - Array of attachments
 * @param {number} [options.type=0] - Optional mail type
 * @param {string} [options.extra=""] - Extra metadata
 * @returns {Promise<Mail>}
 */
async function sendMail({
  userId = 0,
  title,
  content,
  attachment = [],
  type = 0,
  extra = ""
}) {
  if (!title || !content) throw new Error("Missing mail title or content");

  // Auto-generate unique mail ID
  const mailId = Date.now() + Math.floor(Math.random() * 1000);

  const mail = new Mail({
    id: mailId,
    userId,
    title,
    content,
    sendDate: Date.now(),
    status: MailStatuses.UNREAD,
    type,
    attachment,
    extra
  });

  await mail.save();

  // 🟨 Grant VIP immediately if included in mail (only for non-global)
  if (userId !== 0 && Array.isArray(attachment)) {
    for (const item of attachment) {
      if (item.type === 2 && item.vipLevel && item.vipDuration) {
        const now = Date.now();
        const durationMs = item.vipDuration * 86400 * 1000;

        const vip = await Vip.fromUserId(userId);
        const currentExpire = vip.getExpireDate();

        const newExpire = currentExpire > now
          ? currentExpire + durationMs
          : now + durationMs;

        vip.setLevel(item.vipLevel);
        vip.setExpireDate(newExpire);
        await vip.save();
      }
    }
  }

  return mail;
}

/**
 * Gets the mailbox (personal + global mails) for a given user.
 * @param {number} userId
 * @param {boolean} [removeReadMails=false]
 * @returns {Promise<Mail[]>}
 */
async function getMailboxByUserId(userId, removeReadMails = false) {
  const userMailsRaw = await model.find({ modelName: "Mail", userId }).lean();
  const userMails = userMailsRaw.map(doc => new Mail(doc));

  const globalMailsRaw = await model.find({ modelName: "Mail", userId: 0 }).lean();
  const globalMails = globalMailsRaw.map(doc => {
    const mail = new Mail(doc);
    mail.userId = userId;
    mail.status = MailStatuses.UNREAD;
    return mail;
  });

  const allMails = userMails.concat(globalMails);

  const result = allMails.filter(mail => {
    if (mail.getStatus() === MailStatuses.DELETE) return false;
    if (removeReadMails && mail.getStatus() === MailStatuses.READ) return false;
    return true;
  });

  return result;
}

module.exports = {
  sendMail,
  getMailboxByUserId
};