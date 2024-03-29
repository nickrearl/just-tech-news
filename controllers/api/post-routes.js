const router = require('express').Router()
const { Post, User, Vote } = require('../../models')
const sequelize = require('../../config/connection')

router.get('/', (req, res) => {

    Post.findAll({
        attributes: [
            'id', 
            'post_url', 
            'title', 
            'created_at',
            [sequelize.literal('(SELECT COUNT(*) FROM vote WHERE post.id = vote.post_id)'), 'vote_count']
        ],
        order: [['created_at', 'DESC']],
        include: [{
            model: User,
            attributes: ['username']
        }]
    })
    .then(dbPostData => res.json(dbPostData))
    .catch(err => {
        console.log(err)
        res.status(500).json(err)
    })
})

router.get('/:id', (req, res) =>{
    Post.findOne({
        where: {
            id: req.params.id
        },
        attributes: [
            'id', 
            'post_url', 
            'title', 
            'created_at',
            [sequelize.literal('(SELECT COUNT(*) FROM vote WHERE post.id = vote.post_id)'), 'vote_count']
        ],
        include: [
            {
                model: User,
                attributes: ['username']
            }
        ]
    })
    .then(dbPostData => {
        if(!dbPostData){
            res.status(404).json({ message: 'No post found with this id' })
            return
        }
        res.json(dbPostData)
    })
    .catch(err =>{
        console.log(err)
        res.status(500).json(err)
    })
})

router.post('/', (req, res) => {
    Post.create({
        title: req.body.title,
        post_url: req.body.post_url,
        user_id: req.body.user_id
    })
    .then(dbPostData => res.json(dbPostData))
    .catch(err => {
        console.log(err)
        res.status(500).json(err)
    })
})

router.put('/upvote', (req, res) => {
    
    if (req.session) {
    
    Post.upvote({ ...req.body, user_id: req.session.user_id }, { Vote, Comment, User })
        .then(updatedVoteData => res.json(updatedVoteData))
        .catch(err => {
            console.log(err);
            res.status(500).json(err);
        });
    }
});

router.put('/:id', (req, res)=>{
    Post.update(
        {
            title: req.body.title
        },
        {
            where: {
                id: req.params.id
            }
        }
    )
    .then(dbPostData => {
        if(!dbPostData){
            res.status(404).json({ message: 'No post found with this id.'})
            return
        }
        res.json(dbPostData)
    })
    .catch(err=>{
        console.log(err)
        res.status(500).json(err)
    })
})

router.delete('/:id', (req, res) =>{
    Post.destroy({
        where: {
            id: req.params.id
        }
    })
    .then(dbPostData => {
        res.status(404).json({ message: 'No post found with this id.' })
        return
    })
    .catch(err => {
        console.log(err)
        res.status(500).json(err)
    })
})

module.exports = router