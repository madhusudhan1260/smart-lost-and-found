// An Error that carries an HTTP status code, e.g. throw new HttpError(404, 'Item not found').
// The error-handler middleware turns it into a JSON response.
export default class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}
