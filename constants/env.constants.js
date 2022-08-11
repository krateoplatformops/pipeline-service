module.exports = {
  PORT: process.env.PORT || 8080,
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  SECRET_URI:
    process.env.SECRET_URI ||
    `http://secret-service.${process.env.NAMESPACE}.svc`
}
