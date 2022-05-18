const parsePost = async (data) => {
    const parsedPosts = data.map(
        (item) => {
            const post = {};
            post.timeStamp = item.timeStamp;
            post.author = item.author;
            post.title = item.title;
            post.description = item.description;
            return post;
        }
    )
    return parsedPosts;
}

exports.parsePost = parsePost;