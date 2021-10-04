const orderBy = require('lodash/orderBy')
const countBy = require('lodash/countBy')

const dummy = (blogs) => 1

const totalLikes = (blogs) => {
  const reducer = (sum, blog) => sum + blog.likes

  return blogs.reduce(reducer, 0)
}

const favoriteBlog = (blogs) => orderBy(blogs, 'likes', 'desc')[0]

const mostBlogs = (blogs) => {
  const authorsBlogs = countBy(blogs, 'author')
  const mostBlogs = Object.keys(authorsBlogs).sort(
    (a, b) => authorsBlogs[b] - authorsBlogs[a]
  )[0]

  return {
    author: mostBlogs,
    blogs: authorsBlogs[mostBlogs],
  }
}

const mostLikes = (blogs) => {
  const authorlikes = blogs.reduce((op, { author, likes }) => {
    op[author] = op[author] || 0
    op[author] += likes
    return op
  }, {})
  const mostLikes = Object.keys(authorlikes).sort(
    (a, b) => authorlikes[b] - authorlikes[a]
  )[0]

  return {
    author: mostLikes,
    blogs: authorlikes[mostLikes],
  }
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
}
