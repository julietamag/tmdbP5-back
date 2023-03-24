const S = require("sequelize");
const db = require("./db");
const bcrypt = require("bcrypt");
const capitalize = require('../utils/capitalize')

class Users extends S.Model {
  hash(password, salt) {
    return bcrypt.hash(password, salt);
  }

  validatePassword(password) {
    return this.hash(password, this.salt).then(
      (newHash) => newHash === this.password
    );
  }
}

Users.init(
  {
    name: {
      type: S.STRING,
      allowNull: false,
     
    },
    lastName: {
      type: S.STRING,
      allowNull: false,
    },
    fullName: {
      type: S.VIRTUAL,
      get() {
        return `${this.name} ${this.lastName}`;
      },
    },
    email: {
      type: S.STRING,
      allowNull: false,
    },
    password: {
      type: S.STRING,
      allowNull: false,
    },
    salt: {
      type: S.STRING,
    },
    photo_url: {
      type: S.STRING,
      defaultValue:
        "https://agile.yakubovsky.com/wp-content/plugins/all-in-one-seo-pack/images/default-user-image.png",
    },
    favorites_Show: {
      type: S.ARRAY(S.STRING),
      defaultValue: []
    },
    favorites_Movie: {
      type: S.ARRAY(S.STRING),
      defaultValue: []
    }
  },
  { sequelize: db, modelName: "users" }
);

// HOOKS

Users.beforeCreate((user) => {
  const salt = bcrypt.genSaltSync();

  user.salt = salt;

  return user.hash(user.password, salt).then((hash) => {
    user.password = hash;
  })
  .then(() => {
    // Capitalize first letter of name and lastName
    user.name = capitalize(user.name)
    user.lastName = capitalize(user.lastName)
  });
});



module.exports = Users;
