import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import Input from '../common/input';
import noGroup from '../../img/no-group.png';
import { findGroups } from '../../services/groupService';
import Loader from '../common/loader';

const FindGroups = () => {
  const [groups, setGroups] = useState([]);
  const [query, setQuery] = useState('');
  const [loader, setLoader] = useState(false);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoader(true);
        setGroups(await findGroups(query));
      } catch ({ response }) {
        if (response) toast.error(response.data.message);
      } finally {
        setLoader(false);
      }
    };

    if (query.length > 0) fetchGroups();
    else setGroups([]);
  }, [query]);

  const handleChange = ({ currentTarget: input }) => {
    setQuery(input.value);
  };

  const renderGroups = () =>
    groups.map((group) => (
      <div className="person-info-multiple-el" key={group.link}>
        <div className="round__box-b">
          <Link to={`/group/${group.link}`} className="">
            <img
              src={group.image ? group.image.location : noGroup}
              alt="Group"
            />
          </Link>
        </div>
        {group.name.length > 10
          ? `${group.name.substring(0, 10)}...`
          : group.name}
      </div>
    ));

  return (
    <>
      <Input
        name="search"
        className="search__input fg__find"
        placeholder="Write group name here"
        value={query}
        onChange={handleChange}
        autoFocus
      />
      <div className="person-info-multiple">
        {loader ? (
          <Loader size={6} />
        ) : groups.length ? (
          renderGroups()
        ) : (
          'No groups'
        )}
      </div>
    </>
  );
};

export default FindGroups;
