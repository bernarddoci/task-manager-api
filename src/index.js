const express = require('express');
require('./db/mongoose');
const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');

const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(userRouter, taskRouter);

app.listen(port, () => {
    console.log(`Server is up on port ${port}`);
});

// Middleware example
// app.use((req, res, next) => {
//     if(req.method === 'GET') {
//         res.send('GET requests are disabled');
//     } else {
//         next();
//     }
// });

// app.use((req, res, next) => {
//     res.status(503).send('Site is currently down. Check back soon!');
//     next();
// });


// JWT token example
// const jwt = require('jsonwebtoken');

// const myFunction = async () => {
//     const token = jwt.sign({ _id: 'abc123' }, 'thisismynewcourse', { expiresIn: '7 days' });
//     log('Token:', token);

//     const data = jwt.verify(token, 'thisismynewcourse');
//     log(data);
// }

// myFunction();

// Populate example
// const Task = require('./models/task');
// const User = require('./models/user');

// const main = async () => {
//     // const task = await Task.findById('5de12bd833c84311a801bc9c');
//     // await task.populate('owner').execPopulate();
//     // log(task.owner);

//     const user = await User.findById('5de12bbb33c84311a801bc9a');
//     await user.populate('tasks').execPopulate();
//     log(user.tasks);
// }
// main();

// File upload example
// const multer = require('multer');
// const upload = multer({
//     dest: 'images',
//     limits: {
//         fileSize: 1000000
//     },
//     fileFilter(req, file, cb) {
//         // cb(new Error('File must be a PDF'));
//         // cb(undefined, true);
//         // cb(undefined, false);
//         if(!file.originalname.match(/\.(doc|docx)$/)) {
//             return cb(new Error('Please upload a Word document'))
//         }

//         cb(undefined, true);
//     }
// });

// app.post('/upload', upload.single('upload'), (req, res) => {
//     res.send();
// }, (error, req, res, next) =>{
//     res.status(400).send({error: error.message});
// });