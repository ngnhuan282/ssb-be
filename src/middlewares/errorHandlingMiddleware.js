const HttpStatus = require('http-status');

const errorHandlingMiddleware = (err, req, res, next) => {
  // Nếu không có statusCode, mặc định là 500 (INTERNAL_SERVER_ERROR)
  console.log('=== ERROR DEBUG ===');
  console.log('Error:', err);
  console.log('StatusCode:', err.statusCode);
  console.log('Message:', err.message);
  console.log('Stack:', err.stack);
  console.log('==================');
  if (!err.statusCode)
    err.statusCode = HttpStatus.INTERNAL_SERVER_ERROR;

  const responseError = {
    statusCode: err.statusCode || 500,
    message: err.message || HttpStatus[err.statusCode] || 'Internal Server Error',
    success: false,
    stack: err.stack, // Stack trace để debug
  };


  if (process.env.NODE_ENV !== 'development') {
    delete responseError.stack;
  }


  res.status(responseError.statusCode).json(responseError);
};

module.exports = errorHandlingMiddleware;