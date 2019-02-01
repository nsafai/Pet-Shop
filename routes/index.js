const Pet = require('../models/pet');

module.exports = (app) => {
  /* GET home page. Show ALL pets, paginated */
  app.get('/', (req, res) => {
    const page = req.query.page || 1;

    Pet.paginate({}, { limit: 6, page }).then((results) => {
      res.render('pets-index', { pets: results.docs, pagesCount: results.pages, currentPage: page });
      if (req.header('content-type') === 'application/json') {
        return res.json({ results });
      }
      return res.render('pets-index', { results });
    });
  });
};
