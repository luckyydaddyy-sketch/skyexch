# Commands

https://webdemo.agora.io/basicVideoCall/index.html

# Role

SP = Super Admin
AD = Admin
SMDL = Sub Admin
MDL = Super Master
DL = Master
PL = player
COM = ?

# Install dependencies

```
npm install
```

# Start server

```
npm start
```

# Create .env file with folowing variables

PORT=3002
NODE_ENV=development
MONGODB_URL=mongodb://sky:jeki3444@15.207.117.248:27017/sky
MASTER_DB=sky
JWT_ACCESS_EXPIRATION_MINUTES = 300
JWT_REFRESH_EXPIRATION_DAYS = 24
JWT_SECRET = dummy
JWT_WITH_RE_USER_EXPIRATION_HOURS = 10
JWT_WITHOUT_RE_USER_EXPIRATION_HOURS = 10
S3_BASE_URL = https://dating.fra1.digitaloceanspaces.com
S3_ACCESS_KEY = DO00BUW8JQANGRMQBAUM
S3_SECRET_KEY = JWiQLYhfJphosJT2zmhYu8sfpZbbppekUaZmscZ8qAw
S3_BUCKET_NAME = dating
S3_REGION = fra1
S3_ENDPOINT = fra1.digitaloceanspaces.com
VALID_OTP = 3600
AGORA_KEY = 2c499fcd7e394820a4d79425fb3b59af
AGORA_SECRET = 84ac06be00ae44f4a8e6363d346c3fb8
AGORA_APP_ID = 6f6e9d7fc8064d3684308c5695100b78
AGORA_APP_CERTI = c49d9dbde57347b2a79bca4b028212fa


