const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const app = express();
const HTTP_PORT = 3000;
const CompaniesDB = require("./modules/companiesDB.js");
const db = new CompaniesDB();

app.use(cors());
app.use(express.json());
dotenv.config();

// Defining a simple GET route
app.get('/', function(req, res){
  res.json({ message: 'API Listening' });
});


db.initialize(process.env.MONGODB_CONN_STRING)
    .then(()=>{
        app.listen(HTTP_PORT, ()=>{
            console.log(`server listening on: ${HTTP_PORT}`);
        });

        app.post('/api/companies', async (req, res) => {
            try {
              const newCompany = await db.addNewCompany(req.body);
              res.status(201).json(newCompany);
            } catch (error) {
              console.error('Error adding new company:', error.message);
              res.status(500).json({ error: 'Internal Server Error' });
            }
        });
      
        app.get('/api/companies', async (req, res) => {
            try {
              const { page, perPage, name } = req.query;
              const companies = await db.getAllCompanies(page, perPage, name);
              res.json(companies);
            } catch (error) {
              console.error('Error getting companies:', error.message);
              res.status(500).json({ error: 'Internal Server Error' });
            }
        });
      
        app.get('/api/company/:id', async (req, res) => {
            try {
              const company = await db.getCompanyById(req.params.id);
              if (!company) {
                res.status(204).json({ message: 'Company not found' });
              } else {
                res.json(company);
              }
            } catch (error) {
              console.error('Error getting company by ID:', error.message);
              res.status(500).json({ error: 'Internal Server Error' });
            }
        });
      
        app.put('/api/company/:id', async (req, res) => {
            try {
              const updatedCompany = await db.updateCompanyById(req.body, req.params.id);
              if (!updatedCompany) {
                res.status(204).json({ message: 'Company not found for update' });
              } else {
                res.json(updatedCompany);
              }
            } catch (error) {
              console.error('Error updating company by ID:', error.message);
              res.status(500).json({ error: 'Internal Server Error' });
            }
        });
      
        app.delete('/api/company/:id', async (req, res) => {
            try {
              await db.deleteCompanyById(req.params.id);
              res.status(204).send(); // Success.
            } catch (error) {
              console.error('Error deleting company by ID:', error.message);
              res.status(500).json({ error: 'Internal Server Error' });
            }
        });
    })
    .catch((err)=>{
        console.log(err);
    });

