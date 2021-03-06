## What You'll Need
*   A [Slack account](https://slack.com/)
*   A Cooper Hewitt API key.

## Step 1: Add a Slash Command Configuration
On the [Slash Commands](https://slack.com/apps/A0F82E8CA-slash-commands) page select 'Add Configuration', set the Slash Command you want to use, for our example app, this should be `/museum`. You can set it to anything, so long as you update the handler for it too in the project (see below). For the 'URL' value, use your project's publish URL (Click 'Show'), this has the format 'https://project-name.gomix.me', so in our example app it is 'https://slash-command.gomix.me'. Leave the method to the default 'POST' value and set the other values as you need to, but be sure to copy the Token value for use in the next step.

## Step 2: Copy the Command Token
Copy the token value for the Slash Command into the `.env` file in your  project. You'll see an entry for SLACK_TOKEN. Paste the token against that variable name.

## Step 3: Add Your Cooper Hewitt Key
Copy the token value for your [Cooper Hewitt API token](https://collection.cooperhewitt.org/api/) into the `.env` file in your  project. You'll see an entry for COOPER_HEWITT_TOKEN. Paste the token against that variable name.

That's all of the setup required to get the Slash Command working. To try it out, type the slash command `/museum Hi! I'm feeling caffeinated.`, and you'll get a random piece of art back in Slack. 

## Adjust the color mappings to mood as you like
The colors of the Cooper Hewitt collections are in the ch_css4.json file and there's a dict of color bins to moods in the code. Adjust the mood mapping or add more to suit your own tastes.


#### Wrap Up
You can see other example projects on our [Community Projects](https://gomix.com/community/) page. And if you get stuck, let us know on the [forum](http://support.gomix.com/) and we can help you out.
