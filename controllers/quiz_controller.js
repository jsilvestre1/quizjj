var models = require('../models/models.js');

// Autoload - factoriza el código si ruta incluye: quizId
exports.load = function(req, res, next, quizId) {
	models.Quiz.findById(quizId).then(
		function(quiz) {
			if (quiz) {
				req.quiz = quiz;
			next();
			} else { next(new Error('No existe quizId=' + quizId));}
		}
	).catch(function(error) { next(error);});
};

// GET / quizes
exports.index = function(req, res) {
	var filtro;
	if(req.query.search) {
		var search='%'+req.query.search.replace(/ /g, '%')+'%';
		filtro={where: ["upper(pregunta) like ?", search.toUpperCase()], order: 'pregunta ASC'}
	} else {
		filtro={order: 'pregunta ASC'};
	}
	models.Quiz.findAll(filtro).then(function(quizes) {				
		res.render('quizes/index.ejs', { quizes: quizes, errors: []});
		}
	).catch(function(error) { next(error);})
};

// GET /quizes/:id
exports.show = function(req, res) {
		res.render('quizes/show', {quiz: req.quiz, errors: []});
};

// GET /quizes/:id/answer
exports.answer = function(req, res) {
	var resultado = 'Incorrecto';
		if (req.query.respuesta === req.quiz.respuesta){
			resultado = 'Correcto';
		} 
		res.render('quizes/answer', 
				{quiz: req.quiz, respuesta: resultado, errors: []});
};

// GET /quizes/new
exports.new = function(req, res) {
	var quiz= models.Quiz.build( // crea objeto quiz
			{pregunta: "Pregunta", respuesta: "Respuesta"}
		);

	res.render('quizes/new', {quiz: quiz, errors: []});
};

// POST / quizes/create
exports.create = function(req, res) {
	var quiz= models.Quiz.build( req.body.quiz );

	quiz
	.validate()
	.then(
		function(err) {
			if(err) {
				res.render('quizes/new', {quiz: quiz, errors: err.errors});
			} else {
				quiz 	// guarda en DB los campos pregunta y respuesta de quiz
				.save({fields: ["pregunta", "respuesta"]})
				.then(function(){res.redirect('/quizes')})
			}  //Redireccion HTTP (URL relativo) a lista de preguntas
		}
	);
};