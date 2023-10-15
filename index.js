const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

const app = express();

/* middleware */
app.use(cors());
app.use(express.json());

// const uri = "https://coffee-store-server-5z8ga4sbo-muhammad-neamul-hoqes-projects.vercel.app";
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.481il7d.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        await client.connect();

        const coffeeCollection = client.db('Coffees').collection("coffee");
        const userCollection = client.db('Coffees').collection('users');

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");


        app.get('/coffee', async (req, res) => {
            // const newCoffee = req.body;
            // console.log(newCoffee);
            const cursor = coffeeCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })



        app.put('/coffee/:id', async (req, res) => {
            const id = req.params.id;
            const updatedCoffee = req.body;
            const query = { _id: new ObjectId(id) };
            const options = { upsert: true }
            const coffee = {
                $set: {
                    name: updatedCoffee.name,
                    chef: updatedCoffee.chef,
                    supplier: updatedCoffee.supplier,
                    taste: updatedCoffee.taste,
                    category: updatedCoffee.category,
                    details: updatedCoffee.details,
                    photo: updatedCoffee.photo,
                }
            }

            const result = await coffeeCollection.updateOne(query, coffee, options);

            res.send(result);
        })

        /* to update a product first need to get the product & then edit & then use app.put to update in server */
        app.get('/coffee/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await coffeeCollection.findOne(query);

            res.send(result);
        })

        app.post('/coffee', async (req, res) => {
            const newCoffee = req.body;
            console.log(newCoffee);
            const result = await coffeeCollection.insertOne(newCoffee);
            res.send(result);
        })

        /* must use delete to execute delete */
        app.delete('/coffee/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            console.log(id);
            const result = await coffeeCollection.deleteOne(query);
            console.log(result);
            res.send(result);
        })


        /* User APIs */
        app.get('/user', async (req, res) => {
            /* find users from the database table `userCollection`& form an array of users object */
            const result = await userCollection.find().toArray();
            res.send(result);
        })

        app.post('/user', async (req, res) => {
            const user = req.body;
            console.log(user);
            const result = await userCollection.insertOne(user);
            res.send(result);
        })

        /**
         *  if get 
         * [
         * PATCH http://localhost:5000/user 404 (Not Found) Uncaught (in promise), 
         * SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON
         * ] Error then check :=> 
         * ======================
         * -> the URI in fetch is correct & same as server side pathname
         * -> the method name in server side app.[method name] & in client side on fetch 2nd parameter method
        */
        /**
         *  if get 
         * [
         * Uncaught (in promise) TypeError: Failed to execute 'fetch' on 'Window': Request with GET/HEAD method cannot have body.
         * ] Error then check :=> 
         * ======================
         * -> the method name in server side app.[method name] & in client side on fetch 2nd parameter method
        */
        /**
         * if DB not updated / modified 
         * without any Error then check :=> 
         * ===============================
         *  -> the property name or value in client site fetch 2nd parameter like 'content-type', headers etc 
         * */

        app.patch('/user', async (req, res) => {
            const user = req.body;
            const query = { email: user.email };

            const updateDoc = {
                $set: {
                    lastSignInAt: user.lastSignInAt
                }
            }

            const result = await userCollection.updateOne(query, updateDoc)
            res.send(result);
        })

        app.delete('/user/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            console.log(id);
            const result = await userCollection.deleteOne(query);
            console.log(result);
            res.send(result);
        })


    } catch (error) {
        console.error(error);
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



/* check the app is running  */
app.get('/', (req, res) => {
    res.send('App is running');
})

/* check the server is running */
app.listen(port, () => {
    console.log(`App's server is running on PORT: ${port}`);
})

