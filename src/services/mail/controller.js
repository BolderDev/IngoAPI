const service = require("@mail-service/service");

async function getMailList(request) {
    return await service.getMailList(request.getUserId());
}

async function setMailStatus(request) {
    const mailIds = request.query.ids.split(',')
                                     .map(x => parseInt(x));

    return await service.setMailStatus(request.getUserId(),
                                       mailIds, parseInt(request.query.status));
}

async function receiveMailAttachment(request) {
    return await service.receiveMailAttachment(request.getUserId(),
                                               parseInt(request.query.mailId));
}

async function hasNewMail(request) {
    return await service.hasNewMail(request.getUserId());
}

module.exports = [
    {
        "path": "/mailbox/api/v1/mail",
        "methods": ["GET", "PUT"],
        "functions": [getMailList, setMailStatus]
    },
    {
        "path": "/mailbox/api/v1/mail/attachment",
        "methods": ["PUT"],
        "functions": [receiveMailAttachment]
    },
    {
        "path": "/mailbox/api/v1/mail/new",
        "methods": ["GET"],
        "functions": [hasNewMail]
    }
]