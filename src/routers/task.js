const express = require('express');
const router = new express.Router();
const Task = require('../models/task');
const auth = require('../middleware/auth');
const multer = require('multer');
const sharp = require('sharp');

router.post('/tasks', auth, async (req, res) => {
    // const task = new Task(req.body);
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })
    
    try {
        await task.save();
        res.status(201).send(task);
    } catch (e) {
        res.status(400).send(e);
    }
});

// GET /tasks?completed=true  --- Filter data
// GET /tasks?limit=10&skip=0  --- Pagination
// GET /tasks?sortBy=createdAt_desc
router.get('/tasks', auth, async (req, res) => {
    const match = {};
    const sort = {};

    if(req.query.completed) {
        match.completed = req.query.completed === 'true';
    }

    if(req.query.sortBy) {
        const parts = req.query.sortBy.split('_');
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    }

    try {
        // Both alternatives work 
        // const task = await Task.find({owner: req.user._id});
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate();
        res.send(req.user.tasks);
    } catch (e) {
        res.status(500).send();
    }
})

router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id;
    try {
        // const task = await Task.findById(_id);
        const task = await Task.findOne({ _id, owner: req.user._id });

        if(!task) {
            res.status(404).send();
        }
        res.send(task);
    } catch (e) {   
        res.status(500).send();
    }
})

router.patch('/tasks/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['description', 'completed'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if(!isValidOperation) {
        return res.status(400).send({error: 'Invalid update value!'});
    }
    try {
        // const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true});
        const task = await Task.findOne({_id: req.params.id, owner: req.user._id});
        // const task = await Task.findById(req.params.id);

        if(!task) {
            return res.status(404).send();
        }
        updates.forEach(update => task[update] = req.body[update]);
        await task.save();
        res.send(task);
    } catch (e) {
        res.status(500).send(e);
    }
})

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            cb(new Error('Please upload an image'))
        }
        cb(undefined, true)
    }
})

router.post('/tasks/:id/image', upload.single('image'), auth, async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer()
    const task = await Task.findOne({_id: req.params.id})
    task.image = buffer
    await task.save()
    res.send()

}, (error, req, res, next) => {
    res.status(400).send({error: error.message})
})

router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        // const task = await Task.findByIdAndDelete(req.params.id);
        const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
        if(!task) {
            return res.status(404).send({error: 'Task not found!'});
        }
        res.send(task);
    } catch (error) {   
        res.send(500).send(error);
    }
})

module.exports = router;