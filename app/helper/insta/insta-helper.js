const _ = require('lodash');
const fetch = require('node-fetch');
const inquirer = require('inquirer');

const { 
  instagramIdToUrlSegment: idToSegment, 
  urlSegmentToInstagramId: segmentToId,
} = require('instagram-id-to-url-segment');

const login = async (Instagram, username, password, proxy = null) => {
  try {
    Instagram.state.generateDevice(username);
    if (proxy) Instagram.state.proxyUrl = proxy;

    await Instagram.simulate.preLoginFlow();
    const auth = await Instagram.account.login(username, password);
    process.nextTick(async () => await Instagram.simulate.postLoginFlow());

    return auth;
  } catch (e) {
    e.data = { username };
    throw e;
  }
};
exports.login = login;

exports.getState = async (Instagram, convertToJson = false) => {
  try {
    const state = await Instagram.state.serialize();
    delete state.constants;
    return !convertToJson ? state : JSON.stringify(state);
  } catch (e) {
    throw e;  
  }
}

exports.loadState = async (Instagram, state) => {
  try {
    await Instagram.state.deserialize(state);
  } catch (e) {
    throw e;
  }
}

exports.mediaInfoURL = async (Instagram, url) => {
  try {
    const mediaId = isNumeric(url) ? url : await linkToId(url);
    return await Instagram.media.info(mediaId);
  } catch (e) {
    throw e;
  }
}

const followUser = async (Instagram, usernameToFollow, username = null, password = null) => {
  try {
    console.log(username);
    const userId = (await oneUserByUsername(Instagram, usernameToFollow)).pk;
    const response = await Instagram.friendship.create(userId);
    return response;
  } catch (e) {
    if (e.name === 'IgLoginRequiredError') {
      await login(Instagram, username, password);
      await followUser(Instagram, usernameToFollow, username, password);
    } else throw e;
  }
};
exports.followUser = followUser;

const unfollowUser = async (Instagram, usernameToUnollow, username = null, password = null) => {
  try {
    const userId = (await oneUserByUsername(Instagram, usernameToUnollow)).pk;
    // console.log(userId);
    const response = await Instagram.friendship.destroy(userId);
    // console.log(response);
    return response;
  } catch (e) {
    if (e.name === 'IgLoginRequiredError') {
      await login(Instagram, username, password);
      await followUser(Instagram, usernameToUnollow, username, password);
    } else throw e;
  }
};
exports.unfollowUser = unfollowUser;

const likePost = async (Instagram, auth, url, username = null, password = null) => {
  try {
    console.log(username);
    const mediaId = isNumeric(url) ? url : await linkToId(url);
    await Instagram.media.info(mediaId);

    return await Instagram.media.like({
      mediaId,
      moduleInfo: {
        module_name: 'profile',
        user_id: auth.pk,
        username: auth.username,
      },
      d: 1,  // d - means double-tap. If you liked post by double tap then d=1. You cant unlike post by double tap 
    });
  } catch (e) {
    if (e.name === 'IgLoginRequiredError') {
      await login(Instagram, username, password);
      await likePost(Instagram, auth, url, username, password);
    } else throw e;
  }
}
exports.likePost = likePost;

const postByURL = async (Instagram, url, caption, username = null, password = null) => {
  try {
    const response = await fetch(url);
    const file = await response.buffer();

    return await Instagram.publish.photo({
      file, // image buffer, you also can specify image from your disk using fs
      caption, // nice caption (optional)
    });
  } catch (e) {
    if (e.name === 'IgLoginRequiredError') {
      await login(Instagram, username, password);
      await postByURL(Instagram, url, caption, username, password);
    } else throw e;
  }
}
exports.postByURL = postByURL;

const deletePost = async (Instagram, id, username = null, password = null) => {
  try {
    return await Instagram.media.delete({
      mediaId: id
    });
  } catch (e) {
    if (e.name === 'IgLoginRequiredError') {
      await login(Instagram, username, password);
      await deletePost(Instagram, id, username, password);
    } else throw e;
  }
}
exports.deletePost = deletePost;

const commentPost = async (Instagram, url, content, username = null, password = null) => {
  try {
    console.log(username);
    const mediaId = isNumeric(url) ? url : await linkToId(url);
    await Instagram.media.info(mediaId);

    return await Instagram.media.comment({
      module_name: 'profile',
      mediaId,
      text: content,
    });
  } catch (e) {
    if (e.name === 'IgLoginRequiredError') {
      await login(Instagram, username, password);
      await commentPost(Instagram, url, content, username, password);
    } else throw e;
  }
}
exports.commentPost = commentPost;

const deleteComment = async (Instagram, mediaId, pk, username = null, password = null) => {
  try {
    if (pk.constructor !== Array) pk = [ pk ];
    return await Instagram.media.commentsBulkDelete(mediaId, pk);
  } catch (e) {
    if (e.name === 'IgLoginRequiredError') {
      await login(Instagram, username, password);
      await deleteComment(Instagram, url, content, username, password);
    } else throw e;
  }
}
exports.deleteComment = deleteComment;

const oneUserByUsername = async (Instagram, username) => {
  try {
    return await Instagram.user.searchExact(username);
  } catch (e) {
    throw e;
  }
};
exports.oneUserByUsername = oneUserByUsername;

const searchUserByUsername = async (Instagram, username) => {
  try {
    return await Instagram.user.search(username);
  } catch (e) {
    throw e;
  }
};
exports.searchUserByUsername = searchUserByUsername;

exports.scraper = async (Instagram, type, id, limit = false, 
  {
    strictLimit = false, 
    sleepSecond = 3
  } = {}
) => {
  try {
    let info, infoCount, feed;
    let returnItems = [];
    let fetchCount = 0;

    switch (type) {
      case 'follower': // fetch per 100
        info = await Instagram.user.info(id);
        infoCount = info.follower_count;
        feed = await await Instagram.feed.accountFollowers(info.pk);
        break;

      case 'following': // fetch per 100
        info = await Instagram.user.info(id);
        infoCount = info.following_count;
        feed = await await Instagram.feed.accountFollowing(info.pk);
        break;

      case 'post': // fetch per 12
        info = await Instagram.user.info(id);
        infoCount = info.media_count;
        feed = await Instagram.feed.user(info.pk);
        break;
      
      case 'comment': // fetch per 20
        const tempInfo = await Instagram.media.info(id);
        info = tempInfo.items[0];
        infoCount = info.comment_count;
        feed = await Instagram.feed.mediaComments(info.pk);
        break;

      default: throw new Error('This type isn\'t implemented yet.');
    }

    while (fetchCount < infoCount) {
      const item = await feed.items(); // fetch per 20
      const itemCount = item.length;
      console.log(itemCount);
      returnItems = returnItems.concat(item);
      fetchCount += itemCount;
      if (limit) {
        if (fetchCount >= limit) fetchCount = infoCount;
      }

      if (fetchCount < infoCount) await sleep(sleepSecond);
    }

    return strictLimit ? returnItems.slice(0, limit) : returnItems;
  } catch (e) {
    throw e;
  }
}

exports.IdToLink = (id) => {
  try {
    return `https://www.instagram.com/p/${idToSegment(id)}`;
  } catch (e) {
    throw e;
  }
}

const getURLSegment = (url) => {
  try {
    return url.match(/instagram\.com\/p\/([^\/]*)/)[1];
  } catch (e) {
    throw e;
  }
};

const linkToId = (url) => {
  try {
    const segment = getURLSegment(url);
    return segmentToId(segment);
  } catch (e) {
    throw e;
  }
}

const sleep = async (seconds, logTimer = true) => {
  let ms = seconds * 1000;
  if(logTimer) {
      console.log("Sleeping " + seconds + " seconds");
  }
  return new Promise(resolve => setTimeout(resolve, ms));
}
exports.sleep = sleep;

const isNumeric = (str) => {
  var code, i, len;

  for (i = 0, len = str.length; i < len; i++) {
    code = str.charCodeAt(i);
    if (!(code > 47 && code < 58)) { // lower alpha (a-z)
      return false;
    }
  }
  return true;
};