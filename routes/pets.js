/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
/* eslint-disable global-require */
/* eslint-disable prefer-const */
/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-shadow */
// MODELS

// UPLOADING TO AWS S3
const multer = require('multer');

const upload = multer({ dest: 'uploads/' });
const Upload = require('s3-uploader');

const client = new Upload(process.env.S3_BUCKET, {
  aws: {
    path: 'pets/avatar',
    region: process.env.S3_REGION,
    acl: 'public-read',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  cleanup: {
    versions: true,
    original: true,
  },
  versions: [{
    maxWidth: 400,
    aspect: '16:10',
    suffix: '-standard',
  }, {
    maxWidth: 300,
    aspect: '1:1',
    suffix: '-square',
  }],
});

// for Mailgun email
const nodemailer = require('nodemailer');
const mg = require('nodemailer-mailgun-transport');
const Pet = require('../models/pet');

const auth = {
  auth: {
    api_key: process.env.MAILGUN_API_KEY,
    domain: process.env.EMAIL_DOMAIN,
  },
};

const nodemailerMailgun = nodemailer.createTransport(mg(auth));


// PET ROUTES
module.exports = (app) => {
  // INDEX PET => index.js

  // NEW PET
  app.get('/pets/new', (req, res) => {
    res.render('pets-new');
  });

  // CREATE PET
  app.post('/pets', upload.single('avatar'), (req, res) => {
    let pet = new Pet(req.body);

    if (req.file) {
      client.upload(req.file.path, {}, (err, versions) => {
        if (err) { return res.send({ err }); }
        versions.forEach((image) => {
          let urlArray = image.url.split('-');
          urlArray.pop();
          const url = urlArray.join('-');
          pet.avatarUrl = url;
          pet.save().then((savedPet) => {
            res.send({ savedPet });
          });
        });
      });
    } else {
      return res.send({ pet });
    }
  });

  // SHOW PET
  app.get('/pets/:id', (req, res) => {
    Pet.findById(req.params.id).exec((err, pet) => {
      if (req.header('content-type') === 'application/json') {
        return res.json({ pet });
      }
      return res.render('pets-show', { pet });
    });
  });

  // EDIT PET
  app.get('/pets/:id/edit', (req, res) => {
    Pet.findById(req.params.id).exec((err, pet) => {
      return res.render('pets-edit', { pet });
    });
  });

  // UPDATE PET
  app.put('/pets/:id', (req, res) => {
    let pet = new Pet(req.body);

    if (req.file) {
      client.upload(req.file.path, {}, (err, versions) => {
        if (err) { return res.status(400).send({ err }); }
        versions.forEach((image) => {
          let urlArray = image.url.split('-');
          urlArray.pop();
          const url = urlArray.join('-');
          pet.avatarUrl = url;
          pet.save();
        });
        return res.send({ pet });
      });
    } else {
      return res.send({ pet });
    }

    Pet.findByIdAndUpdate(req.params.id, pet)
      .then((updatedPet) => {
        return res.redirect(`/pets/${updatedPet._id}`);
      })
      .catch((err) => {
        // Handle Errors
        console.log(err);
      });
  });

  // DELETE PET
  app.delete('/pets/:id', (req, res) => {
    Pet.findByIdAndRemove(req.params.id).exec((err, pet) => res.redirect('/'));
  });

  // SEARCH PET
  app.get('/search', (req, res) => {
    // const term = new RegExp(req.query.term, 'i');

    const page = req.query.page || 1;

    let numResults = 0;
    let maxPerPage = 1;

    // Get total amount of search results
    Pet
      .find(
        { $text: { $search: req.query.term } },
      )
      .exec((error, pets) => {
        if (error) { return res.status(400).send(error); }
        numResults = pets.length;
      });

    // Return search results and paginate
    Pet
      .find(
        { $text: { $search: req.query.term } },
        { score: { $meta: 'textScore' } },
      )
      .sort({ score: { $meta: 'textScore' } })
      .skip((page - 1) * maxPerPage)
      .limit(maxPerPage)
      .exec((err, pets) => {
        if (err) { return res.status(400).send(err); }

        if (req.header('Content-Type') === 'application/json') {
          return res.json({ pets });
        // eslint-disable-next-line no-else-return
        } else {
          return res.render('pets-index', {
            pets,
            term: req.query.term,
            pagesCount: (numResults / maxPerPage),
            currentPage: page,
          });
        }
      });
  });

  // PURCHASE PET
  app.post('/pets/:id/purchase', (req, res) => {
    console.log(req.body);
    // Set your secret key: remember to change this to your live secret key in production
    // See your keys here: https://dashboard.stripe.com/account/apikeys
    const stripe = require('stripe')(process.env.PRIVATE_STRIPE_API_KEY);

    // Token is created using Checkout or Elements!
    // Get the payment token ID submitted by the form:
    const token = req.body.stripeToken; // Using Express

    Pet.findById(req.params.id).then((pet) => {
      const charge = stripe.charges.create({
        amount: pet.price * 100,
        currency: 'usd',
        description: `Purchased ${pet.name}, ${pet.species}`,
        source: token,
      }).then((chg) => {
        // convert the amount back to dollars
        const user = {
          email: req.body.stripeEmail,
          amount: chg.amount / 100,
          petName: pet.name,
        };
        // SEND EMAIL
        nodemailerMailgun.sendMail({
          from: 'no-reply@example.com',
          to: user.email, // An array if you have multiple recipients.
          subject: 'Hey you, awesome!',
          template: {
            name: 'email.handlebars',
            engine: 'handlebars',
            context: user,
          },
        }).then((info) => {
          console.log(`Response: ${info}`);
        }).catch((err) => {
          console.log(`Error: ${err}`);
        });
        return res.redirect(`/pets/${req.params.id}`);
      });
    }).catch((err) => {
      console.log(`Error: ${err}`);
    });
  });
};
