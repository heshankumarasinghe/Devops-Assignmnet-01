module.exports = (fn) => {
    return (req, res, next) => {
      // if we pass a function to the catch(), it will automatically execute
      // it with the received argument
      fn(req, res, next).catch(next);
    };
};
