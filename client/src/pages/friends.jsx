import React from 'react';
import AllFriends from '../components/common/allFriends';
import FindUsers from '../components/friends/find';
import LinearNav from '../components/common/linearNav';
import FriendRequests from '../components/friends/requests';

const Friends = () => {
  return (
    <LinearNav
      title="Friends"
      data={[
        {
          name: 'friends',
          label: 'My friends',
          Component: AllFriends,
        },
        {
          name: 'requests',
          label: 'Friend requests',
          Component: FriendRequests,
        },
        {
          name: 'find',
          label: 'Find users',
          Component: FindUsers,
        },
      ]}
    />
  );
};

export default Friends;
