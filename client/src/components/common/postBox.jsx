import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { deletePost } from '../../services/apiService';
import UserContext from './../../context/userContext';
import Time from './time';
import EditPost from './editPost';
import avatar from '../../img/no-avatar.png';

const PostBox = ({ post, refresh }) => {
  const { content, createdAt, image, user, previewLimit, link } = post;
  const { user: currentUser } = useContext(UserContext);
  const [edit, setEdit] = useState(false);
  const isMine = currentUser.link === user.link;

  const contentClassName = `post__box--content${image ? '' : '-only'}`;

  const handleDelete = async () => {
    const success = await deletePost(link);
    if (success) refresh();
  };

  const handleEdit = () => {
    setEdit(true);
  };

  const handleCancel = () => {
    setEdit(false);
  };

  if (edit)
    return (
      <div className="post__box">
        <EditPost post={post} refresh={refresh} cancel={handleCancel} />
      </div>
    );

  return (
    <div className="post__box">
      {image && (
        <div className="post__box--image">
          <img src={image.location} alt="Post image" />
        </div>
      )}

      <div className={contentClassName}>
        <div className="post__box--content-header">
          <Link to={`/${user.link}`} className="post__box--author">
            <div className="post__box--author-img">
              <img
                src={(user.image && user.image.location) || avatar}
                alt="Author image"
              />
            </div>
            <span className="post__box--author-name">{user.username}</span>
          </Link>

          <span className="post__box--at">
            <Time data={createdAt} />
          </span>

          {isMine && (
            <div className="post__box--action clickable dropdown">
              <i className="icon-md ri-more-fill"></i>
              <div className="dropdown-content">
                <div
                  className="dropdown-el clickable d-btn-default"
                  onClick={handleEdit}
                >
                  Edit
                </div>
                <div
                  className="dropdown-el clickable d-btn-danger"
                  onClick={handleDelete}
                >
                  Delete
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="post__box--content-message">
          {content.length < previewLimit
            ? content
            : `${content.substring(0, previewLimit)}...`}
        </div>

        <div className="post__box--content-actions">
          <div className="post__box--actions-part">
            <Link to="" className="post__box--action post__box--action-like">
              <i className="icon ri-heart-line"></i>
              <span>152</span>
            </Link>
            <Link to="" className="post__box--action post__box--action-comment">
              <i className="icon ri-message-3-line"></i>
              <span>14</span>
            </Link>
            <Link to="" className="post__box--action post__box--action-share">
              <i className="icon ri-share-forward-line"></i>
              <span>7</span>
            </Link>
          </div>

          <Link to="" className="post__box--action">
            <i className="icon ri-fullscreen-line"></i>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PostBox;
