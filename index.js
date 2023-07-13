const express = require('express')
const app = express()

app.use(express.json())

let persons = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/api/persons', (request,response) => {
    console.log("get persons")
    response.json(persons)
})

app.get('/api/persons/:id', (request,response) => {
    const id = Number(request.params.id)

    console.log(`get person ${id}`)

    const person = persons.find(person => person.id===id)

    if(person){
      response.json(person)
    }
    else{
      response.status(404).end()
    }
})


app.get('/info', (request,response) => {

    console.log("get info")

    const cur_date = new Date()

    const InfoPage = `<div><p>Phonebook has info for ${persons.length} people</p><p>${cur_date}</p></div>`
    
    response.send(InfoPage)

})

app.delete('/api/persons/:id', (request,response) => {
  const id = Number(request.params.id)

  console.log(`deleting person ${id}`)

  persons = persons.filter(person => person.id!==id)

  response.status(204).end()
  
})

app.post('/api/persons', (request,response) => {

  console.log(request.body)

  const body = request.body

  // console.log(body)

  if (!body.name || !body.number) {
    return response.status(400).json({ 
      error: 'person needs a name and a number' 
    })
  }

  const newPerson = {
    id: Math.floor(Math.random()*1000000),
    name: body.name,
    number: body.number
  }

  persons = persons.concat(newPerson)
  response.json(newPerson)
})


const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})