const axios = require("axios");

function createEpic(title, description, groupId) {
    const gitlabIssueData = JSON.stringify({
        title: title,
        description: description,
    });

    return send("post", `groups/${groupId}/epics`, gitlabIssueData);
}

async function send(method, url, data = undefined) {
    const privateToken = process.env.GITLAB_TOKEN;

    const response = await axios({
        method: method,
        url: `https://gitlab.com/api/v4/${url}`,
        headers: {
            "PRIVATE-TOKEN": privateToken,
            "Content-Type": "application/json",
        },
        data: data,
    });

    return response.data;
}

module.exports = {
    epics: {
        create: createEpic,
    }
}