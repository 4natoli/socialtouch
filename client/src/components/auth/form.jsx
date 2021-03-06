import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Loader from '../common/loader';
import validate from '../../utils/validate';
import userConstraints from '../../validators/userConstraints';

const Form = ({ title, reverse, handleSubmit, btn, init, children }) => {
  const [data, setData] = useState(init);
  const [error, setError] = useState('');
  const [loader, setLoader] = useState(false);

  const handleChange = ({ currentTarget: input }) => {
    setData({ ...data, [input.name]: input.value });
  };

  const onSubmit = async (event) => {
    event.preventDefault();

    const validation = validate(data, userConstraints);
    if (validation) return setError(validation);

    try {
      setLoader(true);
      setError(false);
      await handleSubmit(data);
      setLoader(false);
    } catch ({ response }) {
      setLoader(false);
      setError(response && response.data.message);
    }
  };

  return (
    <>
      <div className="block__header">
        <div className="block__header-el">{title}</div>
        {reverse && (
          <Link to={reverse.link} className="block__header-el reverse">
            {reverse.title}
          </Link>
        )}
      </div>

      {error && <div className="block__error">{error}</div>}

      <div className="block__content">
        {loader && <Loader size={5} />}

        {!loader && (
          <form className="form" onSubmit={onSubmit}>
            {children(handleChange, data)}
            <div className="form__actions">
              {title === 'Sign in' && <Link to="/forgot">Forgot password</Link>}
              <button type="submit">{!btn ? title : btn}</button>
            </div>
          </form>
        )}
      </div>
    </>
  );
};

export default Form;
