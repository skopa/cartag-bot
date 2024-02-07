```shell
TELEGRAM_BOT_TOKEN=
HOOK=

curl -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/setWebhook" -d "url=$HOOK"
```

