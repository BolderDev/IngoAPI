const model = require("@schemas/model");
const responses = require("@common/responses");
const MailAttachmentTypes = require("@constants/MailAttachmentTypes");
const MailStatuses = require("@constants/MailStatuses");
const Mail = require("@models/Mail");

const base = require("@mail-service/base");
const payServiceBase = require("@pay-service/base");
const decorationServiceBase = require("@decoration-service/base");
const userServiceBase = require("@user-service/base");

async function getMailList(userId) {
  const mailDocs = await base.getMailboxByUserId(userId);
  const mails = mailDocs.map(doc => new Mail(doc));
  return responses.success(mails);
}

async function setMailStatus(userId, mailIds, targetStatus) {
  if (targetStatus < MailStatuses.READ || targetStatus > MailStatuses.DELETE) {
    return responses.invalidMailStatus();
  }

  const mailDocs = await base.getMailboxByUserId(userId);
  if (mailDocs.length === 0) return responses.success();

  for (const doc of mailDocs) {
    if (!mailIds.includes(doc.id)) continue;

    const mail = new Mail(doc);
    if (mail.isUnread() && targetStatus === MailStatuses.DELETE) continue;
    if (mail.isUnread() && mail.hasAttachments() && targetStatus > MailStatuses.UNREAD) continue;

    mail.setStatus(targetStatus);
    await mail.save();
  }

  return responses.success();
}

async function receiveMailAttachment(userId, mailId) {
  const mailDocs = await base.getMailboxByUserId(userId, true);
  let target = null;

  for (const doc of mailDocs) {
    if (doc.id === mailId) {
      target = new Mail(doc);
      break;
    }
  }

  if (!target) return responses.mailNotFound();
  const attachments = target.getAttachments();

  if (!attachments || attachments.length === 0) {
    return responses.mailHasNoAttachments();
  }

  for (const att of attachments) {
    switch (att.type) {
      case MailAttachmentTypes.CURRENCY:
        await payServiceBase.addCurrency(userId, att.itemId, att.qty);
        break;
      case MailAttachmentTypes.DRESS:
        await decorationServiceBase.addDresses(userId, [att.itemId]);
        break;
      case MailAttachmentTypes.VIP:
        await userServiceBase.addVip(userId, att.vipLevel, att.vipDuration);
        break;
    }
  }

  target.setStatus(MailStatuses.READ);
  await target.save();

  return responses.success();
}

async function hasNewMail(userId) {
  const mailDocs = await base.getMailboxByUserId(userId);
  for (const doc of mailDocs) {
    const mail = new Mail(doc);
    if (mail.isUnread()) return responses.success(true);
  }
  return responses.success(false);
}

module.exports = {
  getMailList,
  setMailStatus,
  receiveMailAttachment,
  hasNewMail
};
