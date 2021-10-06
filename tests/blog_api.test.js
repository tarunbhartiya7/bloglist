const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const supertest = require('supertest')

const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')
const User = require('../models/user')
const {
  initialBlogs,
  blogsInDb,
  nonExistingId,
} = require('../utils/tests_helper')

let token

beforeEach(async () => {
  await Blog.deleteMany({})
  await User.deleteMany({})

  const testUser = {
    username: 'root',
    password: 'password',
  }

  const passwordHash = await bcrypt.hash(testUser.password, 10)
  const user = new User({ username: testUser.username, passwordHash })

  await user.save()

  const response = await api.post('/api/login').send(testUser)
  token = response.body.token

  const updated = initialBlogs.map((blog) => ({
    ...blog,
    user: user._id,
  }))

  await Blog.insertMany(updated)
})

describe('when there is initially some blogs saved', () => {
  test('blog list application returns the blog posts in the JSON format', async () => {
    await api
      .get('/api/blogs')
      .set('Authorization', 'Bearer ' + token)
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all blogs are returned', async () => {
    const response = await api
      .get('/api/blogs')
      .set('Authorization', 'Bearer ' + token)

    expect(response.body).toHaveLength(initialBlogs.length)
  })

  test('a specific blog is within the returned blogs', async () => {
    const response = await api
      .get('/api/blogs')
      .set('Authorization', 'Bearer ' + token)

    const contents = response.body.map((r) => r.title)

    expect(contents).toContain('First class tests')
  })

  test('the unique identifier property of the blog posts is named id,', async () => {
    const response = await api
      .get('/api/blogs')
      .set('Authorization', 'Bearer ' + token)

    expect(response.body[0].id).toBeDefined()
  })
})

describe('addition of a new blog', () => {
  test('succeeds with valid data', async () => {
    const newBlog = {
      title: 'ES6 patterns',
      author: 'Michael Chan',
      url: 'https://reactpatterns.com/',
      likes: 7,
    }

    await api
      .post('/api/blogs')
      .set('Authorization', 'Bearer ' + token)
      .send(newBlog)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await blogsInDb()
    expect(blogsAtEnd).toHaveLength(initialBlogs.length + 1)

    const contents = blogsAtEnd.map((n) => n.title)
    expect(contents).toContain('ES6 patterns')
  })

  test('if the likes property is missing from the request, it will default to the value 0', async () => {
    const newBlog = {
      title: 'ES6 patterns',
      author: 'Michael Chan',
      url: 'https://reactpatterns.com/',
    }

    const response = await api
      .post('/api/blogs')
      .set('Authorization', 'Bearer ' + token)
      .send(newBlog)

    expect(response.body.likes).toBe(0)
  })

  test('if the title and url properties are missing from the request data, API returns status code 400 Bad Request', async () => {
    const newBlog = {
      author: 'Michael Chan',
    }

    await api
      .post('/api/blogs')
      .set('Authorization', 'Bearer ' + token)
      .send(newBlog)
      .expect(400)
  })
})

describe('deletion of a blog', () => {
  test('succeeds with status code 204 if id is valid', async () => {
    const blogAtStart = await blogsInDb()
    const blogToDelete = blogAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', 'Bearer ' + token)
      .expect(204)

    const blogs = await blogsInDb()

    expect(blogs).toHaveLength(initialBlogs.length - 1)

    const contents = blogs.map((r) => r.title)

    expect(contents).not.toContain(blogToDelete.title)
  })

  test('fails with statuscode 404 if id does not exist', async () => {
    const validNonexistingId = await nonExistingId()

    await api
      .delete(`/api/blogs/${validNonexistingId}`)
      .set('Authorization', 'Bearer ' + token)
      .expect(404)
  })

  test('fails with statuscode 400 id is invalid', async () => {
    const invalidId = '5a3d5da59070081a82a3445'

    await api
      .delete(`/api/blogs/${invalidId}`)
      .set('Authorization', 'Bearer ' + token)
      .expect(400)
  })
})

describe('updation of a blog', () => {
  test('succeeds with status code 200', async () => {
    const blogAtStart = await blogsInDb()
    const blogToUpdate = blogAtStart[0]
    blogToUpdate.likes = 0

    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .set('Authorization', 'Bearer ' + token)
      .send(blogToUpdate)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const blogs = await blogsInDb()
    expect(blogs).toHaveLength(initialBlogs.length)

    const contents = blogs.find((r) => r.title === blogToUpdate.title)
    expect(contents.likes).toBe(blogToUpdate.likes)
  })
})

afterAll(() => {
  mongoose.connection.close()
})
