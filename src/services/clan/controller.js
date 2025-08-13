const service = require("@clan-service/service");

async function getClanRecommendation(request) {
    return await service.getClanRecommendation(request.getUserId());
}

async function getClanInfo(request) {
    return await service.getClanInfo(parseInt(request.query.clanId));
}

async function updateClanInfo(request) {
    return await service.updateClanInfo(request.getUserId(),
                                        request.body.name,
                                        request.body.headPic,
                                        request.body.details,
                                        request.body.tags);
}

async function deleteClan(request) {
    return await service.deleteClan(request.getUserId());
}

async function createClan(request) {
    return await service.createClan(request.getUserId(),
                                    request.body.name,
                                    request.body.headPic,
                                    request.body.details,
                                    request.body.tags);
}

async function getClanMembers(request) {
    const clanId = request.query.clanId
        ? parseInt(request.query.clanId)
        : request.getUserId();
    return await service.getClanMembers(clanId);
}

async function sendClanRequest(request) {
    const clanId = request.body.clanId
        ? parseInt(request.body.clanId)
        : parseInt(request.query.clanId);

    if (!clanId) {
        throw new Error("Missing clanId in request.");
    }

    return await service.sendClanRequest(
        request.getUserId(),
        clanId,
        request.body.msg || request.query.msg || ""
    );
}

async function setMemberRole(request) {
    return await service.setMemberRole(request.getUserId(),
                                       parseInt(request.query.otherId),
                                       parseInt(request.query.type));
}

async function leaveClan(request) {
    return await service.leaveClan(request.getUserId());
}

async function getBaseClanInfo(request) {
    return await service.getBaseClanInfo(request.getUserId());
}

async function removeMember(request) {
    return await service.removeMember(request.getUserId(),
                                      parseInt(request.query.otherId));
}

async function getClanMessages(request) {
    return await service.getClanMessages(request.getUserId(),
                                         request.query.pageNo,
                                         request.query.pageSize);
}

async function inviteFriends(request) {
    const targetFriends = request.query.friendIds.split(',')
                                                 .map(x => parseInt(x));

    return await service.inviteFriends(request.getUserId(),
                                       targetFriends, request.query.msg);
}

async function acceptClanRequest(request) {
    return await service.acceptClanRequest(request.getUserId(),
                                          parseInt(request.query.otherId));
}

async function rejectClanRequest(request) {
    return await service.rejectClanRequest(request.getUserId(),
                                           parseInt(request.query.otherId));
}

async function acceptClanInvitation(request) {
    return await service.acceptClanInvitation(request.getUserId());
}

async function rejectClanInvitation(request) {
    return await service.rejectClanInvitation(request.getUserId());
}

async function getClanNotice(request) {
    return await service.getClanNotice(request.getUserId());
}

async function setClanNotice(request) {
    return await service.setClanNotice(request.getUserId(),
                                       request.body.content);
}

async function getClanDresses(request) {
    return await service.getClanDresses(request.getUserId(),
                                        parseInt(request.params.typeId),
                                        parseInt(request.query.pageNo),
                                        parseInt(request.query.pageSize));
}

async function getClanDressDetails(request) {
    return await service.getClanDressDetails(request.getUserId(),
                                             parseInt(request.params.decorationId));
}

async function purchaseClanDress(request) {
    return await service.purchaseClanDress(request.getUserId(),
                                            parseInt(request.params.decorationId));
}

async function searchClan(request) {
    return await service.searchClan(request.getUserId(),
                                    request.query.clanName,
                                    parseInt(request.query.pageNo),
                                    parseInt(request.query.pageSize));
}

async function getDonationInfo(request) {
    return await service.getDonationInfo(request.getUserId());
}

async function giveDonation(request) {
    return await service.giveDonation(request.getUserId(),
                                      parseInt(request.query.currency),
                                      parseInt(request.query.quantity));
}

async function getDonationHistory(request) {
    return await service.getDonationHistory(request.getUserId(),
                                            parseInt(request.query.pageNo),
                                            parseInt(request.query.pageSize));
}

async function getClanId(request) {
    return await service.getClanId(request.getUserId());
}

async function getGlobalClanRank(request) {
    return await service.getGlobalClanRank(request.query.type,
                                           parseInt(request.query.pageNo),
                                           parseInt(request.query.pageSize));
}

async function getClanRank(request) {
    return await service.getClanRank(request.getUserId(),
                                     request.query.type);
}

async function getClanWealth(request) {
    return await service.getClanWealth(request.getUserId());
}

async function getPersonalTasks(request) {
    return await service.getPersonalTasks(request.getUserId(),
                                          parseInt(request.query.type));
}

async function getClanTasks(request) {
    return await service.getClanTasks(request.getUserId(),
                                      parseInt(request.query.type));
}

async function getTaskReward(request) {
    return await service.getTaskReward(request.getUserId(),
                                       parseInt(request.query.id),
                                       parseInt(request.query.type));
}

async function acceptTask(request) {
    return await service.acceptTask(request.getUserId(),
                                    parseInt(request.query.id),
                                    parseInt(request.query.type));
}

async function setVerificationFree(request) {
    return await service.setVerificationFree(request.getUserId(),
                                             parseInt(request.query.freeVerify));
}

module.exports = [
    {
        "path": "/clan/api/v1/clan/tribe/recommendation",
        "methods": ["GET"],
        "functions": [getClanRecommendation]
    },
    {
        "path": "/clan/api/v1/clan/tribe",
        "methods": ["GET", "POST", "PUT", "DELETE"],
        "functions": [getClanInfo, createClan, updateClanInfo, deleteClan]
    },
    {
        "path": "/clan/api/v1/clan/tribe/member",
        "methods": ["GET", "POST", "PUT", "DELETE"],
        "functions": [getClanMembers, sendClanRequest, setMemberRole, leaveClan]
    },
    {
        "path": "/clan/api/v1/clan/tribe/base",
        "methods": ["GET"],
        "functions": [getBaseClanInfo]
    },
    {
        "path": "/clan/api/v1/clan/tribe/member/remove",
        "methods": ["DELETE"],
        "functions": [removeMember]
    },
    {
        "path": "/clan/api/v1/clan/tribe/member/message",
        "methods": ["GET"],
        "functions": [getClanMessages]
    },
    {
        "path": "/clan/api/v1/clan/tribe/member/invite",
        "methods": ["POST"],
        "functions": [inviteFriends]
    },
    {
        "path": "/clan/api/v1/clan/tribe/member/agreement",
        "methods": ["PUT"],
        "functions": [acceptClanRequest]
    },
    {
        "path": "/clan/api/v1/clan/tribe/member/rejection",
        "methods": ["PUT"],
        "functions": [rejectClanRequest]
    },
    {
        "path": "/clan/api/v1/clan/tribe/member/agreement/invitation",
        "methods": ["PUT"],
        "functions": [acceptClanInvitation]
    },
    {
        "path": "/clan/api/v1/clan/tribe/member/rejection/invitation",
        "methods": ["PUT"],
        "functions": [rejectClanInvitation]
    },
    {
        "path": "/clan/api/v1/clan/tribe/bulletin",
        "methods": ["GET", "POST"],
        "functions": [getClanNotice, setClanNotice]
    },
    {
        "path": "/clan/api/v1/clan/decorations/:typeId",
        "methods": ["GET"],
        "functions": [getClanDresses]
    },
    {
        "path": "/clan/api/v1/clan/decorations/details/:decorationId",
        "methods": ["GET"],
        "functions": [getClanDressDetails]
    },
    {
        "path": "/clan/api/v1/clan/decorations/purchase",
        "methods": ["PUT"],
        "functions": [purchaseClanDress]
    },
    {
        "path": "/clan/api/v1/clan/tribe/blurry/info",
        "methods": ["GET"],
        "functions": [searchClan]
    },
    {
        "path": "/clan/api/v1/clan/tribe/donation",
        "methods": ["GET", "POST"],
        "functions": [getDonationInfo, giveDonation]
    },
    {
        "path": "/clan/api/v1/clan/tribe/donation/history",
        "methods": ["GET"],
        "functions": [getDonationHistory]
    },
    {
        "path": "/clan/api/v1/clan/tribe/id",
        "methods": ["GET"],
        "functions": [getClanId]
    },
    {
        "path": "/clan/api/v1/clan/rank",
        "methods": ["GET"],
        "functions": [getGlobalClanRank]
    },
    {
        "path": "/clan/api/v1/clan/user/rank",
        "methods": ["GET"],
        "functions": [getClanRank]
    },
    {
        "path": "/clan/api/v1/clan/tribe/currency",
        "methods": ["GET"],
        "functions": [getClanWealth]
    },
    {
        "path": "/clan/api/v1/clan/personal/tasks",
        "methods": ["GET"],
        "functions": [getPersonalTasks]
    },
    {
        "path": "/clan/api/v1/clan/tasks",
        "methods": ["GET", "PUT"],
        "functions": [getClanTasks, getTaskReward]
    },
    {
        "path": "/clan/api/v1/clan/tasks/accept",
        "methods": ["PUT"],
        "functions": [acceptTask]
    },
    {
        "path": "/clan/api/v1/clan/free/verification",
        "methods": ["PUT"],
        "functions": [setVerificationFree]
    }
]
