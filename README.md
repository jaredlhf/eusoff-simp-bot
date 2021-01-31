# Eusoff Simp Bot

A telegram bot to allow Eusoffians to request for favours and also help others with daily work, such as tapaoing food.

# Requirements
To use this, you'll need.

1) Telegram bot Token

2) A google account

3) Spreadsheet IDs to the necessary in google sheet format (upload files from this folder to google drive and convert to google sheets files through File > Save as Google Sheets)

# Installation
1) With npm installed, install clasp globally

~~~
npm install -g @google/clasp
~~~
2) Run yarn to install dependencies

3) Enable the Google Apps Script API

4) Then login to Google, clasp login

5) Create the google app, clasp create --title "Eusoff Simp Bot" --type webapp --rootDir src

6) Copy config.js.example into config.js, replace all placeholder values with your own, except for deployment id.

7) Deploy it using clasp deploy to get the deployment id.

8) Take note of the deployment id after Created version x e.g.

~~~
Created version 1.
- <<YOUR DEPLOYMENT ID HERE>> @1.
Now set the deployment id in secret.js along with the bot token and sheet ids.
~~~

9) Run clasp push and clasp deploy -i <<YOUR DEPLOYMENT ID HERE>> to push your code to Google Scripts and deploy it again

10) Run clasp open to open it in google script

11) Click config.js, and click Run > Run Function > setWebHook

12) It will ask you to authorise (for the first time), and it should be ok to do so, click Advanced > Go to Eusoff Simp Bot (unsafe) > Allow

13) Open the app by clasp open --webapp, select the version with your deployment id to open. (This will automatically reset the telegram bot's webhooks)

# Tips
When you want to update your telegram bot with the current code, use clasp push && clasp deploy -i <<YOUR DEPLOYMENT ID>>
