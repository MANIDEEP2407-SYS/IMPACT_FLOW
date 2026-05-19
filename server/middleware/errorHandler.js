export function errorHandler(err, req, res, next) {
  if (err?.name === 'ZodError') {
    const details = err.errors?.map(issue => ({
      path: issue.path?.join('.') || '',
      message: issue.message,
    })) || [];
    return res.status(400).json({
      error: details[0]?.message || 'Validation failed',
      details,
    });
  }

  if (err?.name === 'CastError') {
    return res.status(400).json({ error: 'Invalid identifier' });
  }

  const status = err.status || err.statusCode || 500;
  res.status(status).json({ error: err.message || 'Internal server error' });
}
