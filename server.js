const express = require('express')
const app = express();
const path = require('path')
var multer = require('multer');
var upload = multer();
require('dotenv').config()

//global middlewares
app.use(express.json())
app.use(express.urlencoded({
    extended: true
}))


//Uploads Directory
app.use("/public", express.static(path.join(__dirname, 'public/uploads')));

//requiring config
const mongo_connection = require(path.join(__dirname, 'config', 'db'))

//requiring routes
const UserRoute = require(path.join(__dirname, 'routes', 'auth.route'))
const PostCategoryRoute = require(path.join(__dirname, 'routes', 'post.category.route'))
const PostRoute = require(path.join(__dirname, 'routes', 'post.route'))
const CommentRoute = require(path.join(__dirname, 'routes', 'comment.route'))

//Routing
app.use('/auth', UserRoute)
app.use('/category', PostCategoryRoute)
app.use('/post', PostRoute)
app.use('/comment', CommentRoute)


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