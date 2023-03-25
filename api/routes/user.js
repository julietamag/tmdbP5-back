const { generateToken } = require("../config/tokens");
const validateAuth = require("../config/auth")
const Users = require("../models/Users");
const express = require("express");
const router = express.Router();
const capitalize = require("../utils/capitalize");
const S = require("sequelize");

// CREATE NEW USER
router.post("/register", (req, res, next) => {
  Users.create(req.body)
    .then(() => {
      res.sendStatus(201);
    })
    .catch(next);
});

//SIGN IN
router.post("/login", (req, res, next) => {
  const { email, password } = req.body;
  Users.findOne({
    where: {
      email: email,
    },
  }).then((user) => {
    if (!user) res.status(401);
    user.validatePassword(password).then((isValid) => {
      if (!isValid) return res.sendStatus(401);

      const payload = {
        id: user.id,
        name: user.name,
        lastName: user.lastName,
        email: email,
        favorites_Movie: user.favorites_Movie,
        favorites_Show: user.favorites_Show,
      };

      const token = generateToken(payload);

      res
        .cookie("token", token, {
          domain: "localhost",
          path: "/",
        })
        .send(payload);
    });
  });
});

//LOGOUT
router.post("/logout", (req, res, next) => {
  res.clearCookie("token", {
    httpOnly: true,
    domain: "localhost",
    path: "/",
  });

  return res.sendStatus(204);
});

// GET USER PROFILE
router.get("/profile/:id", validateAuth, (req, res, next) => {
  Users.findOne({ where: { id: req.params.id } })
    .then((user) => {
      const { password, salt, ...filteredData } = user.dataValues;
      res.send(filteredData);
    })
    .catch(next);
});

//ADD FAVORITE
router.post("/:userId/favorites/:id", validateAuth, (req, res, next) => {
  Users.findByPk(req.params.userId)
    .then((user) => {
      if (!user) return res.sendStatus(404);
      const { id } = req.params;
      const { type } = req.body;
      const { favorites_Movie, favorites_Show } = user;
      if (
        favorites_Movie.indexOf(id) !== -1 ||
        favorites_Show.indexOf(id) !== -1
      ) {
        return res.sendStatus(409); // Conflict: already added to favorites
      } else {
        if (type === "tv") {
          return user.update({
            favorites_Show: [...user.favorites_Show, id],
          });
        } else {
          return user.update({
            favorites_Movie: [...user.favorites_Movie, id],
          });
        }
      }
    })
    .then(() => res.sendStatus(204))
    .catch(next);
});

//REMOVE FAVORITE MOVIE
router.delete("/:userId/favorites/:id", validateAuth, (req, res, next) => {
  Users.findByPk(req.params.userId)
    .then((user) => {
      if (!user) return res.sendStatus(404);
      const { id } = req.params;
      const { favorites_Movie, favorites_Show } = user;
      const index = favorites_Movie.indexOf(id);
      const newFavoritesMovie = [...favorites_Movie];
      const newFavoritesShow = [...favorites_Show];

      if (index !== -1) newFavoritesMovie.splice(index, 1);
      else {
        const index = newFavoritesShow.indexOf(id);
        if (index !== -1) newFavoritesShow.splice(index, 1);
        else return res.sendStatus(404);
      }

      return user.update({
        favorites_Movie: newFavoritesMovie,
        favorites_Show: newFavoritesShow,
      });
    })
    .then(() => res.sendStatus(204))
    .catch(next);
});

//SEARCH USER
router.get("/search", (req, res, next) => {
  let query = capitalize(req.query.query);
  Users.findAll({
    where: {
      [S.Op.or]: [
        { name: { [S.Op.like]: `%${query}%` } },
        { lastName: { [S.Op.like]: `%${query}%` } },
      ],
    },
  })
    .then((results) => {
      if (!results) res.statusCode(404);
      res.send(results);
    })
    .catch(next);
});

//CHANGE USER PROFILE PICTURE
router.put("/imageChange/:id", (req, res, next) => {
  Users.findByPk(req.params.id)
    .then((user) => {
      user.update({
        photo_url: req.body.photo_url,
      });
    })
    .catch(next);
});

router.get("/", (req, res, next) => {
  Users.findAll().then((user) => res.send(user));
});

module.exports = router;
