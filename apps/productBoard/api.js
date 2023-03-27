const axios = require("axios");

async function getCustomFieldValue(entityId, fieldId) {
    return send('get', `hierarchy-entities/custom-fields-values/value?hierarchyEntity.id=${entityId}&customField.id=${fieldId}`);
}

async function getCustomFields(type) {
    return send('get', `hierarchy-entities/custom-fields?type=${type}`);
}

async function getFeature(featureId) {
    return send("get", `features/${featureId}`);
}

async function getComponent(componentId) {
    return send("get", `components/${componentId}`);
}

async function createConnection(featureID, data) {
    const integrationID = process.env.PB_INTEGRATION_ID;

    return send(
        "put",
        `plugin-integrations/${integrationID}/connections/${featureID}`,
        data
    );
}


async function send(method, url, data = undefined) {
    const token = process.env.PB_TOKEN;

    const resp = await axios({
        method: method,
        url: `https://api.productboard.com/${url}`,
        headers: {
            "X-Version": "1",
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        data: data,
    });

    return resp.data.data;
}

module.exports = {
    components: {
        get: getComponent,
    },
    features: {
        get: getFeature,
    },
    customFields: {
        getMany: getCustomFields,
    },
    customFieldValues: {
        get: getCustomFieldValue
    },
    connections: {
        create: createConnection,
    }
}