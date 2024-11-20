// migrate data with proper format

const { MongoClient } = require("mongodb");

local = {
  "https://cdn.s3waas.gov.in/s3cee631121c2ec9232f3a2f028ad5c89b/uploads/2023/11/2023110749.pdf":
    {
      title: "About DMFT GO 36",
      tagString:
        "Vizianagaram District <-> DEPARTMENTS <-> District Mineral Foundation Trust, Vizianagaram",
    },
};

production;

const db1 = "mongodb://localhost:27017/andhra5"; // connectlocal db
const db2 = "mongodb://localhost:27017/andhra4"; // connect prod db

const sourceClient = new MongoClient(db1);
const targetClient = new MongoClient(db2);

try {
  const sourceDb = sourceClient.db();
  const targetDb = targetClient.db();

  const collections = await sourceDb.listCollections().toArray();

  for (let i = 0; i < collections.length; i++) {
    // get 100/200/500 at a time
    let limit = 100;
    let offset = 0;
    let docs = {};

    while (true) {
      // let sourceDocuments =. fetch from the local db collection using limit and offset
      const sourceDocuments = await sourceDb
        .collection(collections[i].name)
        .find()
        .skip(offset)
        .limit(limit)
        .toArray();

      // format the document and push to docs variable
      for (const doc of sourceDocuments) {
        docs[doc["pdfUrls"]] = {
          title: doc["title"],
          tagString: doc[""],
        };
      }

      // if we are getting less documents than limit then there is no documents left in the collection, else update offset
      if (sourceDocuments.length < limit) {
        break;
      } else {
        offset += limit;
      }
    }

    while (true) {
      // let targetDocuments =. fetch from the local db collection using limit and offset
      const targetDocuments = await targetDb
        .collection(collections[i].name)
        .find()
        .skip(offset)
        .limit(limit)
        .toArray();

      for (const doc of targetDocuments) {
        if (docs.hasOwnProperty(doc["pdfUrl"])) {
          doc["title"] = docs["pdfUrls"]["title"];
        }
      }

      if (targetDocuments.length < limit) {
        break;
      } else {
        offset += limit;
      }

      // keep update in db
      await targetDb
        .collection(collections[i].name)
        .insertMany(targetDocuments);
    }
  }
} catch (error) {}

// const { MongoClient } = require('mongodb');

// const uri = "mongodb+srv://deepakkumar:M92xjniipmDT8rtK@cluster0.z2d9d.mongodb.net/andhra?retryWrites=true&w=majority&appName=Cluster0"; // Replace with your connection string
// const client = new MongoClient(uri);

// async function renameCollection() {
//     try {
//         await client.connect();
//         const database = client.db("andhra"); // Replace with your database name
//         const oldCollection = "apgovs"; // Replace with the old collection name
//         const newCollection = "andhraGov"; // Replace with the new collection name

//         await database.collection(oldCollection).rename(newCollection);
//         console.log(`Collection renamed from '${oldCollection}' to '${newCollection}'`);
//     } catch (error) {
//         console.error("Error renaming collection:", error);
//     } finally {
//         await client.close();
//     }
// }

// renameCollection();
