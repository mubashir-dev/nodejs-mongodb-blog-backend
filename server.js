const express = require('express')
const app = express();
const path = require('path')
require('dotenv').config()

//global middlewares
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

//requiring config
const mongo_connection = require(path.join(__dirname, 'config', 'db'))

//requiring routes
const UserRoute = require(path.join(__dirname, 'routes', 'auth.route'))


//User Route
app.use('/auth', UserRoute)


// 404 Handling
app.use((req, res, next) => {

    const error = new Error('Not Found')
    error.status = 404
    next(error)
})

//error handling

app.use((err, req, res, next) => {

    res.status(err.status || 500)
    res.send({
        error: {
            status: err.status || 500,
            message: err.message || 'Internal Server Error'
        }
    })

})

app.listen(process.env.PORT, () => {
    console.log(`Your Application is running on PORT ${process.env.PORT}`);
})


