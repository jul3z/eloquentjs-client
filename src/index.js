import Builder from './Eloquent/Builder';
import Model from './Eloquent/Model';
import RestfulJsonConnection from './Connection/RestfulJsonConnection';
import Eloquent from './Factory';

Eloquent.Builder = Builder;
Eloquent.Model = Model;
Eloquent.RestfulJsonConnection = RestfulJsonConnection;

export default Eloquent;