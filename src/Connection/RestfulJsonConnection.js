import Connection from './Connection';

/**
 * RestfulJsonConnection
 *
 * This sends queries to a given endpoint over HTTP using
 * RESTful conventions. If additional query methods are
 * called, these are encoded in the (http) query string.
 *
 * The endpoint *must* be set before this connection is used.
 */
export default class RestfulJsonConnection extends Connection {

    /**
     * Create a new RestfulJsonConnection
     *
     * @param  {string} [endpoint]
     */
    constructor(endpoint) {
        super();

        /**
         * The base URL for this connection.
         *
         * @protected
         * @type {string}
         */
        this.endpoint = endpoint;
    }

    /**
     * Run an INSERT query.
     *
     * @param  {Object} data
     * @return {Promise}
     */
    create(data) {
        return this._fetch(null, null, 'post', data)
            .then(response => this.unwrap(response))
        ;
    }

    /**
     * Run a SELECT type query.
     *
     * @param  {number} id
     * @param  {array} queryStack
     * @return {Promise}
     */
    read(id, queryStack) {
        return this._fetch(id, queryStack)
            .then(response => this.unwrap(response))
        ;
    }

    /**
     * Run an UPDATE query.
     *
     * @param  {number} id
     * @param  {Object} data
     * @param  {array} queryStack
     * @return {Promise}
     */
    update(id, data, queryStack) {
        return this._fetch(id, queryStack, 'put', data)
            .then(response => this.unwrap(response))
        ;
    }

    /**
     * Run a DELETE query.
     *
     * @param  {number} id
     * @param  {array} queryStack
     * @return {Promise}
     */
    delete(id, queryStack) {
        return this._fetch(id, queryStack, 'delete')
            .then(response => response.status === 200)
        ;
    }

    /**
     * Wrapper around window.fetch
     *
     * @param  {number} [id]
     * @param  {array} [queryStack]
     * @param  {string} [method]
     * @param  {Object} [data]
     * @return {Promise}
     */
    _fetch(id, queryStack, method, data) {
        return fetch(
            this.url(id, queryStack),
            this._makeInit(method, data)
        );
    }

    /**
     * Take a fetch response and extract the JSON.
     *
     * @param  {Response} response
     * @return {Object}
     */
    unwrap(response) {
        return response.json();
    }

    /**
     * Get a URL to the endpoint.
     *
     * @param  {number} [id]
     * @param  {array} [query]
     * @return {string}
     */
    url(id, query) {
        if ( ! this.endpoint) {
            throw 'Endpoint must be set before using this connection';
        }

        let url = this.endpoint;

        if (id) {
            url += '/'+id;
        }

        if (query && query.length) {
            return `${url}?query=${JSON.stringify(query)}`;
        }

        return url;
    }

    /**
     * Make an options hash for the fetch `init` parameter.
     *
     * @see  https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#Parameters
     * @param  {string} [method]
     * @param  {Object} [data]
     * @param  {Object} [options]
     * @return {Object}
     */
    _makeInit(method, data, options) {

        let defaults = {
            credentials: 'same-origin', // to send our session cookie
            headers: {
                'Accept': 'application/json',
                'X-XSRF-TOKEN': getCsrfToken()
            }
        };

        if (method) {
            defaults.method = method;
        }

        if (data) {
            defaults.headers['Content-Type'] = 'application/json';
            defaults.body = JSON.stringify(data);
        }

        return Object.assign(defaults, options || {});
    }
}

function getCsrfToken()
{
    if (typeof document === 'undefined') return;

    return decodeURIComponent((document.cookie.match('(^|; )XSRF-TOKEN=([^;]*)') || 0)[2]);
}
