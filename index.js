// Node packages being used
const express = require("express");
const bodyParser = require("body-parser"); // Parses JSON bodies
const cookieParser = require("cookie-parser");
const app = express().use(bodyParser.text());
const port = process.env.PORT || 3000;
const gitlabApi = require("./apps/gitLab/api");
const pbApi = require("./apps/productBoard/api"); // Sends HTTP requests
require('dotenv').config();

// Configuration of our server
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());

// Initial route to confirm app is running
app.get("/", (req, res) => {
    res.send("This is the server hosting our Productboard <> GitLab integration");
});

// Probe for basic verification of the destination URL. More info here: https://developer.productboard.com/#tag/pluginIntegrations
app.get("/plugin", (req, res) => {
    res.setHeader("Content-type", "text/plain");
    res.status(200).send(req.query.validationToken);
});

// Endpoint where POST requests from Productboard plugin will be sent. More info here: https://developer.productboard.com/#operation/postPluginIntegration
app.post("/plugin", async (req, res) => {
    try {
        res.json({
            auth: req.header('Authorization'),
        })


        res.status(200).end();
        return;


        // Determine action on button trigger. Can be push, dismiss, or unlink.
        if (req.body.data.trigger !== "button.push") {
            res.json({
                data: {
                    connection: {
                        state: "initial",
                    },
                },
            });

            res.status(200).end();
            return;
        }

        const pbFeatureID = req.body.data.feature.id;
        const feature = await pbApi.features.get(pbFeatureID)
        const productId = await findProductIdByFeature(feature)
        const gitlabGroupId = await getProductCustomFieldValue(productId, 'GitLab Group');
        const gitlabEpic = await createGitlabEpic(gitlabGroupId, feature);
        createIntegrationConnection(feature.id, gitlabEpic.id, gitlabEpic.web_url);

        res.json({
            data: {
                connection: {
                    state: "connected",
                },
            },
        });

        res.status(200).end();
    } catch (e) {
        res.status(500).end();
    }
});

// Initiating server to listen for requests from PB and GitLab
app.listen(port, () => {
    console.log(`GitLab integration is listening on port ${port}`);
});

async function getProductCustomFieldValue(productId, fieldName) {
    const customFields = await pbApi.customFields.getMany('number');
    const field = customFields.find(f => f.name === fieldName);
    const fieldValue = await pbApi.customFieldValues.get(productId, field.id);
    return fieldValue.value;
}

async function getSubFeatureProductId(subFeature) {
    const feature = await pbApi.features.get(subFeature.parent.feature.id);
    return getFeatureProductId(feature);
}

async function getFeatureProductId(feature) {
    const component = await pbApi.components.get(feature.parent.component.id);
    return component.parent.product.id;
}

async function createIntegrationConnection(featureID, epicID, epicURL) {
    const requestData = JSON.stringify({
        data: {
            connection: {
                state: "connected",
                label: "Opened",
                hoverLabel: `Epic ${epicID}`,
                tooltip: `Epic ${epicID}`,
                color: "blue",
                targetUrl: epicURL,
            },
        },
    });

    return pbApi.connections.create(featureID, requestData)
}

async function findProductIdByFeature(feature) {
    if (feature.type === 'feature') {
        return getFeatureProductId(feature)
    }

    return getSubFeatureProductId(feature);
}

async function createGitlabEpic(gitlabGroupId, feature) {
    const {name, description, links} = feature;
    const linkHtml = `<br><strong>Click <a href="${links.html}" target="_blank">here</a> to see feature in Productboard</strong>`;
    return gitlabApi.epics.create(name, description + linkHtml, gitlabGroupId);
}