const dummy = (blogs) => 1;

const blogpostLikes = (blogs) =>
  blogs.reduce((acc, { likes }) => acc + likes, 0);

const mostLikes = (blogs) => {
  const mostLikedPost = blogs.reduce(
    (mostLikes, blogPost) =>
      blogPost.likes > mostLikes.likes ? blogPost : mostLikes,
    blogs[0]
  );

  console.log('el post con mas likes', mostLikedPost);

  return mostLikedPost;
};

const mostBlogs = (blogs) => {};

module.exports = { dummy, blogpostLikes, mostLikes, mostBlogs };
