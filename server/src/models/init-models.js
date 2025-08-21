import _admins from './admins.js'
import _place_images  from './place_images.js'
import _places from './places.js'
import _users from './users.js';

const initModels = (sequelize) => {
  const admins = _admins(sequelize);
  var place_images = _place_images(sequelize);
  var places = _places(sequelize);
  var users = _users(sequelize);

  place_images.belongsTo(places, { as: "place", foreignKey: "place_id"});
  places.hasMany(place_images, { as: "place_images", foreignKey: "place_id"});

  return {
    admins,
    place_images,
    places,
    users,
  };
}
export default initModels;

