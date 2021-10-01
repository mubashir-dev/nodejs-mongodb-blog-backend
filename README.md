# Nodejs-Mongodb-Blog-Backend
This is a simple node.js and express.js backend for handling simple blog,it has been powered up with MongoDB as database.it has the following modules.

| Module | Detail |
| ------ | ------ |
| Authentication | Responsible for Authentication and Authorization |
| Post | Responsible for Post Management |
| PostCategory | Responsible for Post Category Management |
| Comments | Responsible for all operations related to comments |

## Installation
To setup this system on local you need to follow the process.
```sh
node i nodemon -g
npm i
```

Copy and Change .env file present in project

```sh
MONGO_PASS=''
MONGO_URL=''
MONGO_DB=""
JWT_SECRET=YOUR-SECRET-KEY
JWT_TIMEOUT_DURATION=EXPIRE-TIME
```
After making changes in .env,now you are  good to go
```sh
nodemon start 
```
