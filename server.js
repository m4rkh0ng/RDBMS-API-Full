const express = require('express');

const knexDb = require('./data/db');

const server = express();

server.use(express.json());

//endpoints here
server.get('/', (req, res) => {
    res.send('up and running...');
});

// ===USERS===

// [GET] `/users` This route will return an array of all users.
server.get('/users', (req, res) => {
    knexDb('users')
    .then(users => {
        res.status(200).json(users);
    })
    .catch(err => {
        res.status(500).json(err);
    });
})

// [POST] `/users` This route should save a new user to the database.
server.post('/users', (req, res) => {
    const user = req.body;

    // console.log(user);
    if( user.name === '' || !user.name) {
        res.status(404).json({message: "Hey, where's your user name?"});
        return;
    }
    knexDb.insert(user).into('users')
    .then(ids => {
        const id = ids[0];

        res.status(201).json({ id, ...user});
    })
    .catch(err => {
        res.status(500).json(err);
    });
})

// [GET] `/users/:id` This route will return the user with the matching `id`.

server.get('/users/:id', (req, res) => {

    knexDb(`users`).where('id', req.params.id)
    .then(users => {
        res.status(200).json(users);
    })
    .catch(err => {
        res.status(500).json(err);
    });
})

// [GET] `/users/:id/posts` returns all posts for the user with the specified `id`.
server.get('/users/:id/posts', (req, res) => {
    const { id } = req.params;

    knexDb(`posts`).where('userId', id)
    .then(posts => {
        res.status(200).json(posts);
    })
    .catch(err => {
        res.status(500).json(err);
    });
})

// [PUT] `/users/:id` This route will update the user with the matching `id` using information sent in the body of the request.

server.put('/users/:id', (req,res) => {
    // const userId = req.params.id;
    const { id } = req.params;
    const name = req.body;

    if(!name || name === '') {
        res.status(400).json({message: "No name filled out in request of the body."})
    }
    
    knexDb('users')
    .where({ id })
    .update(name)
    .then(response => {

        if(!response) {
            res.status(404).json({errorCat: `https://http.cat/404`, message: `Couldn't update.`})
            return;
        }
        knexDb('users')
        .where({id})
        .then(user => {
            res.status(200).json({user, message: "Successfully updated ."});
        })
    })
    .catch(err => res.status(500).json({errorMessage:"500 Internal Server Error", err}))
})

// [DELETE] `/users/:id` This route should delete the specified user.

server.delete('/users/:id', (req, res) => {
    const { id } = req.params;
    
    knexDb('users')
    .where({ id })
    .del()
    .then(response => {
        if (!response) {
            res.status(404).json({response, message: `User ${id} does not exist.`})
            return;
        }
        res.status(201).json({response, message: `User ${id} has been deleted.`});
    })
    .catch(err => {
        res.status(500).json(err);
    })
})


// ===POSTS===

// [GET] `/posts` This route will return an array of all posts.

server.get('/posts', (req, res) => {
    knexDb('posts')
    .then(posts => {
        res.status(200).json(posts);
    })
    .catch(err => {
        res.status(500).json(err);
    });
})

// [POST] `/posts` This route should save a new post to the database.

server.post('/posts', (req, res) => {
    const post = req.body;

    if( post.text === '' || !post.text) {
        res.status(404).json({message: "Hey, where's your post's text?"});
        return;
    }
    knexDb.insert(post).into('posts')
    .then(ids => {
        const id = ids[0];

        res.status(201).json({ id, ...post});
    })
    .catch(err => {
        res.status(500).json(err);
    });
})

// [GET] `/posts/:id` This route will return the post with the matching `id`.

server.get('/posts/:id', (req, res) => {
    const { id } = req.params;

    knexDb(`posts`).where('id', id)
    .then(post => {
        console.log(post.toString());
        if(post.toString() === '') {
            res.status(404).json({message: "No post with that ID exists."})
            return;
        }
        res.status(200).json(post);
    })
    .catch(err => {
        res.status(500).json(err);
    });
})

// [PUT] `/posts/:id` This route will update the post with the matching `id` using information sent in the body of the request.

server.put(`/posts/:id`, (req,res) => {
    // const userId = req.params.id;
    const { id } = req.params;
    const { userId, text } = req.body;

    if(!text || text === '') {
        res.status(400).json({message: "No text filled out in request of the body."})
    }
    
    knexDb('posts')
    .where({ id })
    // .update({ userId, text, id: req.body.id }) <-- just to try it out, 
    // I wanted to see if changing the ID would be okay to do, 
    // but this is mainly for personal reference and not for actual use
    .update({ userId, text })
    .then(response => {

        if(!response) {
            res.status(404).json({errorCat: `https://http.cat/404`, message: `Couldn't update.`})
            return;
        }
        knexDb('posts')
        .where({id})
        .then(post => {
            res.status(200).json({post, message: "Successfully updated ."});
        })
    })
    .catch(err => res.status(500).json({errorMessage:"500 Internal Server Error", err}))
})


// [DELETE] `/posts/:id` This route should delete the specified post.

server.delete('/posts/:id', (req, res) => {
    const { id } = req.params;
    
    knexDb('posts')
    .where({ id })
    .del()
    .then(response => {
        if (!response) {
            res.status(404).json({response, message: `Post ${id} does not exist.`})
            return;
        }
        res.status(201).json({response, message: `Post ${id} has been deleted.`});
    })
    .catch(err => {
        res.status(500).json(err);
    })
})

// ===TAGS===

// [POST] `/tags` This route should save a new tag to the database.

server.post('/tags', (req, res) => {
    const tag = req.body;

    if( tag.tag === '' || !tag.tag) {
        res.status(404).json({message: "Hey, where's the tag?"});
        return;
    }
    knexDb.insert(tag).into('tags')
    .then(ids => {
        const id = ids[0];

        res.status(201).json({ id, ...tag});
    })
    .catch(err => {
        res.status(500).json(err);
    });
})

// [GET] `/tags` This route will return an array of all tags

server.get('/tags', (req,res) => {
    knexDb('tags')
    .then(tags => {
        res.status(200).json({tags});
    })
    .catch(err => {
        res.status(500).json({err, message:"500 Internal Server Error"})
    })
})

// [GET] `/tags/:id` This route will return the tag with the matching `id`.
server.get('/tags/:id', (req,res) => {
    const id = req.params;

    knexDb('tags')
    .where(id)
    .then(tag => {
        if(tag.toString() === '') {
            res.status(404).json({message: "Doesn't look like that tag exists."})
            return;
        }
        res.status(200).json({tag});
    })
    .catch(err => {
        res.status(500).json({err, message:"500 Internal Server Error"})
    })
})

// [PUT] `/tags/:id` This route will update the tag with the matching `id` using information sent in the body of the request.



// [DELETE] `/tags/:id` This route should delete the specified tag.



// LISTEN
const port = 8111;
server.listen(port,function() {
    console.log(`\n=== Web API listening on http://localhost:${port} ===\n`);
})