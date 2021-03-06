module.exports = {
  age: {
    type: {
      type: 'number',
      message: 'Age must be a number',
    },
  },
  gender: {
    format: {
      pattern: '^(male|female)$',
      flags: 'i',
      message: 'Gender must be male or female',
    },
  },
};
