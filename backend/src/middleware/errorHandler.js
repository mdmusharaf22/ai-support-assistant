export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  // PostgreSQL errors
  if (err.code === '23505') {
    return res.status(409).json({
      success: false,
      error: 'Resource already exists'
    });
  }
  
  if (err.code === '23503') {
    return res.status(400).json({
      success: false,
      error: 'Referenced resource does not exist'
    });
  }
  
  // Custom application errors
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message
    });
  }
  
  // Default error
  return res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message
  });
};
