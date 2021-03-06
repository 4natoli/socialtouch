import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import UserContext from '../../context/userContext';
import Time from '../common/time';
import avatar from '../../img/no-avatar.png';

const CommentBox = ({ user, comment, handleDelete }) => {
  const { user: currentUser } = useContext(UserContext);
  const isMine = currentUser.link === user.link;

  const renderOptions = () => (
    <div className="post__box--action clickable dropdown">
      <i className="icon-md ri-more-fill" />
      <div className="dropdown-content">
        <button
          type="button"
          className="dropdown-el clickable d-btn-danger"
          onClick={() => handleDelete(comment.link)}
        >
          Delete
        </button>
      </div>
    </div>
  );

  return (
    <div className="comment">
      <div className="comment__user-image">
        <div className="round__box">
          <Link to={`/${user.link}`}>
            <img src={user.image ? user.image.location : avatar} alt="User" />
          </Link>
        </div>
      </div>
      <div className="comment__data">
        <div className="comment__header">
          <Link to={`/${user.link}`}>{user.username}</Link>
          <div className="comment-at post__box--at">
            <Time data={comment.createdAt} />
          </div>
          {isMine && renderOptions()}
        </div>
        <div className="comment__content">{comment.content}</div>
      </div>
    </div>
  );
};

export default CommentBox;
