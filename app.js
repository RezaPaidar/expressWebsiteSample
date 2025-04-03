const express = require('express');
const fs = require('fs');
const app = express();
const morgan = require('morgan');

// 1) Middlewares
app.use(morgan('dev'));
app.use(express.json()); //middleware tp process request body for post

app.use((req, res, next) => {
  console.log('Hello from the middelware');
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

// 2) Route Handlers

const getAllTours = (req, res) => {
  console.log(req.requestTime);

  res.status(200).json({
    requestAt: req.requestTime,
    status: 'success',
    results: tours.length,
    data: {
      tours: tours,
    },
  });
};

const getTour = (req, res) => {
  const id = req.params.id * 1;
  const tour = tours.find((el) => el.id === id);
  if (!tour) {
    return res.status(404).json({
      status: 'failed',
      message: 'invalid Id',
    });
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
};

const CreateTour = (req, res) => {
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);
  tours.push(newTour);
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour,
        },
      });
    }
  );
};

const UpdateTour = (req, res) => {
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: 'failed',
      message: 'invalid Id',
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour: '<Updated tour here..>',
    },
  });
};

const DeleteTour = (req, res) => {
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: 'failed',
      message: 'invalid Id',
    });
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
};

//app.get('/api/v1/tours', getAllTours);
//app.get('/api/v1/tours/:id', getTour);
//app.post('/api/v1/tours', CreateTour);
//app.patch('/api/v1/tours/:id', UpdateTour);
//app.delete('/api/v1/tours/:id', DeleteTour);

// 3) Route

app.route('/api/v1/tours').get(getAllTours).post(CreateTour);
app
  .route('/api/v1/tours/:id')
  .get(getTour)
  .patch(UpdateTour)
  .delete(DeleteTour);

// 4) Start Server

const port = 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
