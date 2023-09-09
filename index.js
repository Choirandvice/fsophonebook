const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
require('dotenv').config()
const app = express()
const Person = require('./models/person')

app.use(cors())
app.use(express.json())
app.use(express.static('build'))

class AlreadyDeletedError extends Error{
  constructor(message){
    super(message)
    this.name = "AlreadyDeletedError"
  }
}

morgan.token('body', (request,response)=>{
  return JSON.stringify(request.body)
})

const respondWithTiny = (request, response) => {
  return (request.method!=="POST"&&request.method!=="PUT")
}

const respondWithBody = (request,response) => {
  return (request.method==="POST"||request.method==="PUT")
}
app.use(morgan('tiny',{ skip: respondWithBody }))

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body', {skip: respondWithTiny}))

app.get('/api/persons', (request,response) => {

  console.log("getting all persons")  

  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.get('/api/persons/:id', (request, response, next) => {

    console.log(`getting person: ${request.params.id}`)

    Person.findById(request.params.id)
    .then(person => {
      if(person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})


app.get('/info', (request,response) => {

    console.log(`getting info`)

    const cur_date = new Date()

    Person.find({}).then(persons => {
      const InfoPage = `<div><p>Phonebook has info for ${persons.length} people</p><p>${cur_date}</p></div>`
      response.send(InfoPage)
    })

})

app.delete('/api/persons/:id', (request,response,next) => {

  console.log(`deleting person: ${request.params.id}`)

  Person.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request,response,next) => {

  const body = request.body

  console.log(`creating person: ${request.body}`)

  const newPerson = new Person({
    name: body.name,
    number: body.number
  })

  newPerson.save().then(savedPerson => {
    response.json(savedPerson)
  })
  .catch(error => next(error))

})

app.put('/api/persons/:id', (request, response, next) => {

  const body = request.body
  
  const person = {
    name: body.name,
    number: body.number,
  }

  console.log(`updating person: ${body.name}|${body.number}`)

  Person.findByIdAndUpdate(request.params.id, person, {new:true, runValidators: true, context: 'query'})
    .then(updatedPerson => {
      // this returns null if the person has already been removed
      if(updatedPerson!=null){
        response.json(updatedPerson)
      }
      else{
        throw new AlreadyDeletedError(`Error: ${body.name} already removed from the server`)
      }
    })
    .catch(error => next(error))
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error("error:", error)
  console.error("error.name", error.name)
  console.error("Errorhandler:",error.message)

  if(error.name === 'CastError'){
    return response.status(400).send({error: 'malformatted id'})
  } else if (error.name === 'ValidationError'){
    return response.status(400).json({ error: error.message})
  } else if (error.name === 'AlreadyDeletedError'){
    return response.status(500).json({error: error.message})
  }

  next(error)
}

app.use(errorHandler)