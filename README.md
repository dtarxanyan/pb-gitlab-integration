# ProductBoard -> GitLab integration

This is a basic integration between ProductBoard and GitLab that allows you top push features from ProductBoard to a GitLab project as epics.

# Environment Variables

 - ```APP_PRIVATE_TOKEN``` <br/>
This is a private token that should be generated manually. Our application will deny any request where Authorization header with token will note match to ```APP_PRIVATE_TOKEN```.
See also ```How to create Productboard integration``` section
<br/><br/>
 - ```PB_TOKEN``` <br/>
The product board ```Public Api Token```. It is being used to be able to send authorized requests to the Productboard API.
Click <a href="https://developer.productboard.com/#section/Authentication/Getting-a-token">Here</a> to learn how to get Productboard ```Public Api Token```.
<br/><br/>
- ```PB_INTEGRATION_ID``` <br/>
Id of the Productboard integration. See ```How to create Productboard integration``` section
<br/><br/> 
- ```GITLAB_TOKEN``` <br/>
Gitlab personal access token with ```api``` and ```read_api``` scopes. It is being used to be able to send authorized requests to the Gitlab API.
Click <a href="https://docs.gitlab.com/ee/user/profile/personal_access_tokens.html">Here</a> to learn how to generate Gitlab private token.

# How to create Productboard integration
Need to make a POST request to the ProductBoard API. This is one time work and can be 
done manually using ```Postman``` or other requesting tool

```POST https://api.productboard.com/plugin-integrations```

<code>
<pre>
{
    "data": {
        "integrationStatus": "enabled",
        "type": "com.mydomain.myservice",
        "name": "My great integration",
        "initialState": {
            "label": "Push" // The label of the push button that will become visible on Productboard feature 
        },
        "action": { // Where the POST request will be senr
            "url": "https://my.integration.com/plugin",
            "version": 1,
            "headers": {
                "authorization": APP_PRIVATE_TOKEN // See environment variables section
            }
        }
    }
}
</pre>
</code>

The response of the integration creation request will include the 
integration id which needs to be stored as a value of the ```PB_INTEGRATION_ID```  environment variable

Make sure that ```authorization``` field that we are sending to the Productboard while creating a new integration 
is matching to our ```APP_PRIVATE_TOKEN``` environment variable value. It will be sent with each outgoing request from 
Productboard to our integration system within the ```Authorization``` header.

See more details about plugin creation <a href="https://developer.productboard.com/#tag/pluginIntegrations">here</a>