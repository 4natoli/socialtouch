import React, { useState } from 'react';

const LinearNav = ({ data, def, title }) => {
  const [selection, setSelection] = useState(def || data[0].name);

  const renderButton = ({ name, label }) => (
    <button
      type="button"
      className={`btn btn-dark ${selection === name ? 'active' : ''}`}
      onClick={() => setSelection(name)}
      key={name}
    >
      {label}
    </button>
  );

  const renderComponent = () => {
    const { Component } = data.find((el) => el.name === selection);

    return <Component />;
  };

  return (
    <div className="content__fg">
      <div className="fg__header">
        {title && <div className="fg__title centered">{title}</div>}
        <div className="fg__buttons">{data.map((el) => renderButton(el))}</div>
      </div>
      <div className="fg_content">{renderComponent()}</div>
    </div>
  );
};

export default LinearNav;
