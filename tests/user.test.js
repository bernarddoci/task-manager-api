const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/user');
const { userOneId, userOne, setupDatabase} = require('./fixtures/db')

beforeEach(setupDatabase);

test('Should signup a new user', async () => {
    const response = await request(app)
        .post('/users').send({
            name: 'Bernard Doci',
            email: 'bernard.doci@gmail.com',
            password: 'Beni123'
        })
        .expect(201);

    // Assert that the databes was changed correctly
    const user = await User.findById(response.body.user._id);
    expect(user).not.toBeNull();
    // Assertions about the response 
    // expect(response.body.user.name).toBe('Bernard Doci');
    expect(response.body).toMatchObject({
        user: {
            name: 'Bernard Doci',
            email: 'bernard.doci@gmail.com',
        },
        token: user.tokens[0].token
    })

    expect(user.password).not.toBe('Beni123')
})

test('Should not signup user with invalid name/email/password', async () => {
    request(app)
        .post('/users')
        .send({
            name: 123,
            email: 'blabla.com',
            password: 'password'
        })
        .expect(400)
})

test('Should login existing user', async () => {
    const response = await request(app).post('/users/login').send({
        email: userOne.email,
        password: userOne.password
    }).expect(200)

    const user = await User.findById(userOneId);
    expect(response.body.token).toBe(user.tokens[1].token);
})

test('Should not login nonexistent user', async () => {
    await request(app).post('/users/login').send({
        email: userOne.email,
        password: 'thisiswrongpassword'
    }).expect(400);
})

test('Should get profile for user', async () => {
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
})

test('Should not get profile for unauthenticated user', async () => {
    await request(app)
        .get('/user/me')
        .send()
        .expect(404)
})

test('Should delete account for user', async () => {
    await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    const user = await User.findById(userOneId);
    expect(user).toBeNull();
})

test('Should not delte account for unauthenticated user', async () => {
    await request(app)
        .delete('/users/me')
        .send()
        .expect(401)
})

test('Should upload avatar image', async () => {
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .attach('avatar', 'tests/fixtures/profile-pic.jpg')
        .expect(200)

    const user = await User.findById(userOneId);
    expect(user.avatar).toEqual(expect.any(Buffer));
})

test('Should update valid user fields', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            name: 'Jess'
        })
        .expect(200);

    const user = await User.findById(userOneId);
    expect(user.name).toEqual('Jess')
})

test('Should not update user if unauthenticated', async () => {
    const response = await request(app)
        .patch('/users/me')
        .send({
            name: 'Anonymous'
        })
        .expect(401)
    
    const user = await User.findById(userOneId);
    expect(user.name).toBe('Dominik Uksihini')
})

test('Should not update user with invalid name/email/password', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            name: '',
            email: '',
            password: ''
        })
        .expect(400)
})


test('Should not update invalid user fields', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            location: 'Pristina'
        })
        .expect(400);
})