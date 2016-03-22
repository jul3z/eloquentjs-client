import Model from './Eloquent/Model';
import RestfulJsonConnection from './Connection/RestfulJsonConnection';

/**
 * Define or retrieve a model definition.
 *
 * @param {string} name
 * @param {Object|function(base: Model): Model|undefined} [definition]
 *
 * The definition can be either an object of properties
 * to merge into the class, or a callback that receives
 * the base class and returns an extended class definition.
 * Or, omit this argument to fetch the named model.
 *
 * @example
 * // Define an Eloquent model with an object that
 * // extends the base Model definition.
 * Eloquent('Post', {
 *   endpoint: 'api/posts'
 * });
 *
 * // Define an Eloquent model with a callback
 * Eloquent('Post', function (modelDefinition) {
 *   modelDefinition.endpoint = 'api/posts';
 *   return modelDefinition;
 * });
 *
 * // Fetch a previously defined model
 * let Post = Eloquent('Post');
 *
 * // or
 * let Post = Eloquent.Post;
 *
 * // It's (mostly) the same API as Laravel's Eloquent
 * // so you already know how to query the posts table...
 * Post.whereNotNull('published')
 *     .orderBy('published')
 *     .get()
 *     .then(function (results) {
 *         console.log(results);
 *     });
 *
 * // ... or new up an instance ...
 * let post = new Post({
 *   author: 'David',
 *   body: 'Hello, my name is David.'
 * });
 * console.log(post.author); // David
 *
 * // ... or save a new record ...
 * Post.create({
 *   author: 'Derek',
 *   body: 'Hello David, my name is Derek.'
 * });
 */
let Eloquent = function (name, definition) {

    if ( ! Eloquent.booted) {
        Eloquent.boot();
    }

    if (definition) {
        Object.defineProperty(Eloquent, name, {
            get: function () {
                return Eloquent.make(name);
            }
        });

        return Eloquent.register(name, definition);
    }

    return Eloquent.make(name);
};

/**
 * Boot our Eloquent implementation.
 *
 * @returns {void}
 */
Eloquent.boot = function () {

    const modelsDefined = new Map();
    const modelsMade = new Map();

    Eloquent.register = function (modelName, modelProperties) {

        let init = modelProperties;

        // If properties are an object, convert to a callback that
        // receives a base model and returns an extended child model
        if (typeof modelProperties !== 'function') {
            init = function (BaseModel) {
                return Object.assign(BaseModel, modelProperties);
            };
        }

        // Create a factory function that sets up models
        // according to the given modelProperties, boots,
        // and creates the default connection.
        let modelFactory = function factory(BaseModel) {
            let NewModel = init(class extends BaseModel {});

            NewModel.prototype.bootIfNotBooted();
            NewModel.prototype.connection = new RestfulJsonConnection(NewModel.endpoint);

            Object.keys(NewModel.relations).forEach(relationName => {
                let relatedModel = NewModel.relations[relationName];
                NewModel.relations[relationName] = function () {
                    return Eloquent.make(relatedModel);
                };
            });

            return NewModel;
        };

        return modelsDefined.set(modelName, modelFactory);
    };

    Eloquent.make = function (modelName) {

        if ( ! modelsMade.has(modelName)) {

            let factory = modelsDefined.get(modelName);

            if (factory === null) {
                throw new Error(`Model [${modelName}] not registered`);
            }

            modelsMade.set(modelName, factory(Model));
        }

        return modelsMade.get(modelName);
    };

    Eloquent.booted = true;
};

export default Eloquent;