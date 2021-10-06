const {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
  initialBlogs,
} = require('../utils/tests_helper')

test('dummy returns one', () => {
  const blogs = []

  const result = dummy(blogs)
  expect(result).toBe(1)
})

describe('totalLikes', () => {
  test('of empty list is zero', () => {
    expect(totalLikes([])).toBe(0)
  })

  test('when list has only one blog equals the likes of that', () => {
    const listWithOneBlog = [
      {
        _id: '5a422aa71b54a676234d17f8',
        title: 'Go To Statement Considered Harmful',
        author: 'Edsger W. Dijkstra',
        url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
        likes: 5,
        __v: 0,
      },
    ]
    expect(totalLikes(listWithOneBlog)).toBe(5)
  })

  test('of a bigger list is calculated right', () => {
    expect(totalLikes(initialBlogs)).toEqual(36)
  })

  test('blog with most likes is calculated right', () => {
    const expected = {
      title: 'Canonical string reduction',
      author: 'Edsger W. Dijkstra',
      url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
      likes: 12,
    }
    expect(favoriteBlog(initialBlogs)).toEqual(expected)
  })

  test('author with most blogs is calculated right', () => {
    const expected = {
      author: 'Robert C. Martin',
      blogs: 3,
    }
    expect(mostBlogs(initialBlogs)).toEqual(expected)
  })

  test('author with most likes is calculated right', () => {
    const expected = {
      author: 'Edsger W. Dijkstra',
      blogs: 17,
    }
    expect(mostLikes(initialBlogs)).toEqual(expected)
  })
})
